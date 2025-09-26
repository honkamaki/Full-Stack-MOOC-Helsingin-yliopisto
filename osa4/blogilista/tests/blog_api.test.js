// tests/blog_api.test.js
const { describe, test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')

const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const { MONGODB_URI, NODE_ENV } = require('../utils/config')

const api = supertest(app)

const initialBlogsData = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
]

let rootUser // luodaan ennen jokaista testiä

before(async () => {
  if (NODE_ENV !== 'test') {
    throw new Error('Tests must run with NODE_ENV=test')
  }
  await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  rootUser = await new User({ username: 'root', name: 'Root', passwordHash }).save()

  // lisää alkuperäiset blogit liitettynä rootUseriin
  const blogs = initialBlogsData.map(b => ({ ...b, user: rootUser._id }))
  const inserted = await Blog.insertMany(blogs)

  // linkitä myös käyttäjälle
  rootUser.blogs = inserted.map(b => b._id)
  await rootUser.save()
})

describe('GET /api/blogs', () => {
  // 4.8
  test('returns blogs as JSON with correct length', async () => {
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.length, initialBlogsData.length)
  })

  // 4.9
  test('blogs have id field, not _id', async () => {
    const res = await api.get('/api/blogs').expect(200)
    for (const blog of res.body) {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    }
  })

  // 4.17
  test('blogs include populated user (username & name)', async () => {
    const res = await api.get('/api/blogs').expect(200)
    const blog = res.body[0]
    assert.ok(blog.user)
    assert.strictEqual(blog.user.username, 'root')
    assert.strictEqual(blog.user.name, 'Root')
    // varmistetaan ettei passwordHash paljastu
    assert.strictEqual(blog.user.passwordHash, undefined)
  })
})

describe('POST /api/blogs', () => {
  // 4.10
  test('creates a new blog; count increases by one and content matches', async () => {
    const beforeCount = await Blog.countDocuments()

    const newBlog = {
      title: 'Testing with SuperTest',
      author: 'FSO Student',
      url: 'https://example.com/supertest',
      likes: 3,
    }

    const postRes = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const afterCount = await Blog.countDocuments()
    assert.strictEqual(afterCount, beforeCount + 1)

    const saved = await Blog.findOne({ title: newBlog.title }).populate('user', 'username name').lean()
    assert.ok(saved)
    assert.strictEqual(saved.author, newBlog.author)
    assert.strictEqual(saved.url, newBlog.url)
    assert.strictEqual(saved.likes, newBlog.likes)
    // 4.17: blogille määrittyy automaattisesti lisääjä (joku käyttäjä, esim root)
    assert.ok(saved.user)
    assert.strictEqual(saved.user.username, 'root')

    // myös POST-vastauksessa user on mukana
    assert.ok(postRes.body.user)
    assert.strictEqual(postRes.body.user.username, 'root')
  })

  // 4.11*
  test('defaults likes to 0 when missing', async () => {
    const newBlogWithoutLikes = {
      title: 'No likes field given',
      author: 'FSO Student',
      url: 'https://example.com/nolikes'
    }

    const res = await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.likes, 0)

    const saved = await Blog.findOne({ title: newBlogWithoutLikes.title }).lean()
    assert.ok(saved)
    assert.strictEqual(saved.likes, 0)
  })

  // 4.12*
  test('400 if title is missing', async () => {
    const beforeCount = await Blog.countDocuments()

    const newBlog = {
      author: 'No Title',
      url: 'https://example.com/notitle',
      likes: 1
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const afterCount = await Blog.countDocuments()
    assert.strictEqual(afterCount, beforeCount)
  })

  // 4.12*
  test('400 if url is missing', async () => {
    const beforeCount = await Blog.countDocuments()

    const newBlog = {
      title: 'No URL',
      author: 'Missing Url',
      likes: 2
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const afterCount = await Blog.countDocuments()
    assert.strictEqual(afterCount, beforeCount)
  })
})

describe('DELETE /api/blogs/:id', () => {
  // 4.13
  test('deletes an existing blog, returns 204 and reduces count by one', async () => {
    const startBlogs = await Blog.find({}).lean()
    const blogToDelete = startBlogs[0]
    assert.ok(blogToDelete)

    await api.delete(`/api/blogs/${blogToDelete._id.toString()}`).expect(204)

    const endBlogs = await Blog.find({}).lean()
    assert.strictEqual(endBlogs.length, startBlogs.length - 1)

    const ids = endBlogs.map(b => b._id.toString())
    assert.ok(!ids.includes(blogToDelete._id.toString()))
  })

  test('returns 404 when deleting non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    await api.delete(`/api/blogs/${fakeId}`).expect(404)
  })

  test('returns 400 for malformatted id', async () => {
    await api.delete('/api/blogs/this-is-not-an-objectid').expect(400)
  })
})

describe('PUT /api/blogs/:id', () => {
  // 4.14*
  test('updates likes for an existing blog and returns the updated doc', async () => {
    const [target] = await Blog.find({}).limit(1)
    assert.ok(target)
    const newLikes = (target.likes || 0) + 5

    const res = await api
      .put(`/api/blogs/${target._id.toString()}`)
      .send({ likes: newLikes })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.likes, newLikes)

    const fromDb = await Blog.findById(target._id).lean()
    assert.ok(fromDb)
    assert.strictEqual(fromDb.likes, newLikes)
  })

  test('returns 404 when updating non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    await api.put(`/api/blogs/${fakeId}`).send({ likes: 999 }).expect(404)
  })

  test('returns 400 for malformatted id', async () => {
    await api.put('/api/blogs/not-an-objectid').send({ likes: 1 }).expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})
