// app.js
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Blog = require('./models/blog')
const User = require('./models/user')

const app = express()
app.use(cors())
app.use(express.json())

// --- BLOGIT ---

// GET all blogs (4.17: populate user)
app.get('/api/blogs', async (_req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', 'username name')
    res.json(blogs)
  } catch (err) {
    next(err)
  }
})

// POST blog (4.17: kytke blogi johonkin olemassa olevaan käyttäjään, esim. ensimmäinen)
app.post('/api/blogs', async (req, res, next) => {
  try {
    const { title, author, url, likes } = req.body
    if (!title || !url) {
      return res.status(400).json({ error: 'title and url are required' })
    }

    // hae joku käyttäjä (tässä vaiheessa ei ole väliä kuka)
    const user = await User.findOne({})
    const blog = new Blog({ title, author, url, likes, user: user ? user._id : undefined })
    const saved = await blog.save()

    // jos käyttäjä löytyi, lisää blogin viittaus käyttäjälle
    if (user) {
      user.blogs = user.blogs.concat(saved._id)
      await user.save()
    }

    // palauta populated-versio
    await saved.populate('user', 'username name')
    res.status(201).json(saved)
  } catch (err) {
    next(err)
  }
})

// DELETE one blog
app.delete('/api/blogs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'malformatted id' })
    }
    const deleted = await Blog.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'not found' })
    return res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// PUT update blog (esim. likes)
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
  } catch (err) {
    next(err)
  }
})

// --- KÄYTTÄJÄT ---

// GET all users (4.17: populate blogs)
app.get('/api/users', async (_req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', 'title author url likes')
    res.json(users)
  } catch (err) {
    next(err)
  }
})

// POST create user (4.15 + 4.16*)
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

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({ username, name, passwordHash })
    const saved = await user.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: 'username must be unique' })
    }
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    next(err)
  }
})

// --- Virheenkäsittely ---
app.use((err, _req, res, _next) => {
  console.error(err.name, err.message)
  res.status(500).json({ error: 'server error' })
})

module.exports = app
