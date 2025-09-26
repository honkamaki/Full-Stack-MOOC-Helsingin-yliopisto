// tests/login_api.test.js
const { describe, test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')

const app = require('../app')
const User = require('../models/user')
const { MONGODB_URI, NODE_ENV } = require('../utils/config')

const api = supertest(app)

before(async () => {
  if (NODE_ENV !== 'test') throw new Error('Tests must run with NODE_ENV=test')
  await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  await new User({ username: 'root', name: 'Root', passwordHash }).save()
})

describe('POST /api/login (4.18)', () => {
  test('succeeds with valid username & password and returns token', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(res.body.token)
    assert.strictEqual(res.body.username, 'root')
  })

  test('fails with 401 for invalid password', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' })
      .expect(401)

    assert.match(res.body.error || '', /invalid/i)
  })

  test('fails with 401 for non-existing user', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'ghost', password: 'whatever' })
      .expect(401)

    assert.match(res.body.error || '', /invalid/i)
  })
})

after(async () => {
  await mongoose.connection.close()
})
