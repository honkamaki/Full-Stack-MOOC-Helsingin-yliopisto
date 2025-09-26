// tests/user_api.test.js
const { describe, test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')

const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const { MONGODB_URI, NODE_ENV } = require('../utils/config')

const api = supertest(app)

before(async () => {
  if (NODE_ENV !== 'test') throw new Error('Tests must run with NODE_ENV=test')
  await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const root = await new User({ username: 'root', name: 'Root', passwordHash }).save()

  // luodaan yksi blogi ja liitetään käyttäjälle
  const blog = await new Blog({
    title: 'Root blog',
    author: 'Root',
    url: 'https://root.example',
    likes: 1,
    user: root._id
  }).save()

  root.blogs = [blog._id]
  await root.save()
})

describe('POST /api/users (4.16*)', () => {
  test('succeeds with a fresh username', async () => {
    const start = await User.countDocuments()
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.ok(res.body.id)
    const end = await User.countDocuments()
    assert.strictEqual(end, start + 1)
  })

  test('fails with 400 if username missing', async () => {
    const start = await User.countDocuments()
    const res = await api.post('/api/users').send({ name: 'NoUser', password: 'pass123' }).expect(400)
    assert.match(res.body.error || '', /username/i)
    const end = await User.countDocuments()
    assert.strictEqual(end, start)
  })

  test('fails with 400 if password missing', async () => {
    const start = await User.countDocuments()
    const res = await api.post('/api/users').send({ username: 'noPass', name: 'NoPass' }).expect(400)
    assert.match(res.body.error || '', /password/i)
    const end = await User.countDocuments()
    assert.strictEqual(end, start)
  })

  test('fails with 400 if username shorter than 3', async () => {
    const start = await User.countDocuments()
    const res = await api.post('/api/users').send({ username: 'ab', name: 'Short', password: 'goodpw' }).expect(400)
    assert.match((res.body.error || '').toString(), /username|minlength/i)
    const end = await User.countDocuments()
    assert.strictEqual(end, start)
  })

  test('fails with 400 if password shorter than 3', async () => {
    const start = await User.countDocuments()
    const res = await api.post('/api/users').send({ username: 'validuser', name: 'ShortPw', password: 'ab' }).expect(400)
    assert.match(res.body.error || '', /password/i)
    const end = await User.countDocuments()
    assert.strictEqual(end, start)
  })

  test('fails with 400 if username not unique', async () => {
    const start = await User.countDocuments()
    const res = await api.post('/api/users').send({ username: 'root', name: 'Duplicate', password: 'secret' }).expect(400)
    assert.match(res.body.error || '', /unique|exists/i)
    const end = await User.countDocuments()
    assert.strictEqual(end, start)
  })
})

describe('GET /api/users (4.17)', () => {
  test('returns users with populated blogs (title, author, url, likes)', async () => {
    const res = await api.get('/api/users').expect(200).expect('Content-Type', /application\/json/)
    assert.ok(Array.isArray(res.body))
    const root = res.body.find(u => u.username === 'root')
    assert.ok(root)
    assert.ok(Array.isArray(root.blogs))
    assert.strictEqual(root.blogs.length, 1)
    const b = root.blogs[0]
    assert.ok(b.title)
    assert.ok(b.url)
    assert.strictEqual(typeof b.likes, 'number')
    // varmistus että blogin user ei leviä takaisin tänne (rajattu populate)
    assert.strictEqual(b.user, undefined)
  })
})

after(async () => {
  await mongoose.connection.close()
})
