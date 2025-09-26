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

let rootUser
let authToken // 🔑 talletetaan tänne

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

  // login → token talteen
  const loginRes = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)

  authToken = loginRes.body.token
  assert.ok(authToken)

  // lisää alkuperäiset blogit liitettynä rootUseriin
  const blogs = initialBlogsData.map(b => ({ ...b, user: rootUser._id }))
  const inserted = await Blog.insertMany(blogs)

  rootUser.blogs = inserted.map(b => b._id)
  await rootUser.save()
})

describe('GET /api/blogs', () => {
  // ... (sama kuin ennen)
})

describe('POST /api/blogs', () => {
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
      .set('Authorization', `Bearer ${authToken}`) // 🔑 lisätty
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
    assert.ok(saved.user)
    assert.strictEqual(saved.user.username, 'root')

    assert.ok(postRes.body.user)
    assert.strictEqual(postRes.body.user.username, 'root')
  })

  test('defaults likes to 0 when missing', async () => {
    const newBlogWithoutLikes = {
      title: 'No likes field given',
      author: 'FSO Student',
      url: 'https://example.com/nolikes'
    }

    const res = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`) // 🔑
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.likes, 0)

    const saved = await Blog.findOne({ title: newBlogWithoutLikes.title }).lean()
    assert.ok(saved)
    assert.strictEqual(saved.likes, 0)
  })

  test('400 if title is missing', async () => {
    const beforeCount = await Blog.countDocuments()

    const newBlog = {
      author: 'No Title',
      url: 'https://example.com/notitle',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`) // 🔑
      .send(newBlog)
      .expect(400)

    const afterCount = await Blog.countDocuments()
    assert.strictEqual(afterCount, beforeCount)
  })

  test('400 if url is missing', async () => {
    const beforeCount = await Blog.countDocuments()

    const newBlog = {
      title: 'No URL',
      author: 'Missing Url',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`) // 🔑
      .send(newBlog)
      .expect(400)

    const afterCount = await Blog.countDocuments()
    assert.strictEqual(afterCount, beforeCount)
  })

  // 4.19: lisätestit
  test('401 if token missing', async () => {
    await api
      .post('/api/blogs')
      .send({ title: 'Should fail', author: 'X', url: 'https://x.example' })
      .expect(401)
  })

  test('401 if token invalid', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer notavalidtoken')
      .send({ title: 'Should also fail', author: 'X', url: 'https://x.example' })
      .expect(401)
  })
})


after(async () => {
  await mongoose.connection.close()
})
