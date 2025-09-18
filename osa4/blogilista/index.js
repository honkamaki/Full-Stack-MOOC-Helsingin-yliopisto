const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(express.json())

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

blogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist'
mongoose.set('strictQuery', false)
mongoose
  .connect(mongoUrl)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

app.get('/api/blogs', (req, res, next) => {
  Blog.find({})
    .then(blogs => res.json(blogs))
    .catch(next)
})

app.post('/api/blogs', (req, res, next) => {
  const blog = new Blog(req.body)
  blog.save()
    .then(saved => res.status(201).json(saved))
    .catch(next)
})

// kevyt virheenkäsittely tälle stepille
app.use((err, _req, res, _next) => {
  console.error(err.name, err.message)
  res.status(500).json({ error: 'server error' })
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
