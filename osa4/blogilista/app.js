// app.js
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Blog = require('./models/blog')
const User = require('./models/user')
const { SECRET } = require('./utils/config')
const { tokenExtractor, userExtractor, unknownEndpoint, errorHandler } = require('./utils/middleware')

const app = express()
app.use(cors())
app.use(express.json())

// --- BLOGIT ---

// GET all blogs (populate user)
app.get('/api/blogs', async (_req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', 'username name')
    res.json(blogs)
  } catch (err) { next(err) }
})

// POST blog (4.19: vaatii tokenin ja liittää kirjautuneen käyttäjän)
app.post('/api/blogs', tokenExtractor, userExtractor, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'token required or invalid' })
    }

    const { title, author, url, likes } = req.body
    if (!title || !url) {
      return res.status(400).json({ error: 'title and url are required' })
    }

    const blog = new Blog({
      title,
      author,
      url,
      likes,
      user: req.user._id,
    })
    const saved = await blog.save()

    req.user.blogs = req.user.blogs.concat(saved._id)
    await req.user.save()

    await saved.populate('user', 'username name')
    res.status(201).json(saved)
  } catch (err) {
    next(err)
  }
})

// DELETE blog
app.delete('/api/blogs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'malformatted id' })
    }
    const deleted = await Blog.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'not found' })
    return res.status(204).end()
  } catch (err) { next(err) }
})

// UPDATE blog (likes tms.)
app.put('/api/blogs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'malformatted id' })
    }
    const { title, author, url, likes } = req.body
    const update = { title, author, url, likes }
    const updated = await Blog.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true, context: 'query' }
    ).populate('user', 'username name')
    if (!updated) return res.status(404).json({ error: 'not found' })
    return res.json(updated)
  } catch (err) { next(err) }
})

// --- KÄYTTÄJÄT ---

app.get('/api/users', async (_req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', 'title author url likes')
    res.json(users)
  } catch (err) { next(err) }
})

app.post('/api/users', async (req, res, next) => {
  try {
    const { username, name, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' })
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'username must be at least 3 characters' })
    }
    if (password.length < 3) {
      return res.status(400).json({ error: 'password must be at least 3 characters' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username, name, passwordHash })
    const saved = await user.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err?.code === 11000) return res.status(400).json({ error: 'username must be unique' })
    if (err?.name === 'ValidationError') return res.status(400).json({ error: err.message })
    next(err)
  }
})

// --- LOGIN (4.18) ---
app.post('/api/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    const passwordCorrect = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false

    if (!user || !passwordCorrect) {
      return res.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = { username: user.username, id: user._id.toString() }
    const token = jwt.sign(userForToken, SECRET, { expiresIn: '1h' })

    res.status(200).json({
      token,
      username: user.username,
      name: user.name,
      id: user._id.toString(),
    })
  } catch (err) { next(err) }
})

// --- Virheenkäsittely ---
app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app
