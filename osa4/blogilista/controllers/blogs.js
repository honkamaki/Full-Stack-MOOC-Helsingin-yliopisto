// controllers/blogs.js
const router = require('express').Router()
const Blog = require('../models/blog')

// GET /api/blogs
router.get('/', async (_req, res, next) => {
  try {
    const blogs = await Blog.find({})
    res.json(blogs)
  } catch (err) {
    next(err)
  }
})

// POST /api/blogs
router.post('/', async (req, res, next) => {
  try {
    const blog = new Blog(req.body)
    const saved = await blog.save()
    res.status(201).json(saved)
  } catch (err) {
    next(err)
  }
})

module.exports = router
