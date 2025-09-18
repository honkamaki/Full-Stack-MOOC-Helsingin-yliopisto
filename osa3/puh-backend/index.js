// puh-backend/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import Person from './models/person.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// palvele valmiiksi rakennetun frontin tiedostot (puh-backend/dist)
app.use(express.static('dist'))

// --- API ROUTES ---

// GET kaikki
app.get('/api/persons', async (_req, res, next) => {
  try {
    const persons = await Person.find({})
    res.json(persons)
  } catch (err) {
    next(err)
  }
})

// GET yksi id:llä
app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'malformatted id' })
    }
    const person = await Person.findById(id)
    if (!person) return res.status(404).end()
    res.json(person)
  } catch (err) {
    next(err)
  }
})

// POST uusi
app.post('/api/persons', async (req, res, next) => {
  try {
    const { name, number } = req.body
    const person = new Person({ name, number })
    const saved = await person.save()
    res.status(201).json(saved)
  } catch (err) {
    next(err)
  }
})

// PUT päivitys (3.17*)
app.put('/api/persons/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'malformatted id' })
    }
    const { name, number } = req.body
    const updated = await Person.findByIdAndUpdate(
      id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
    if (!updated) return res.status(404).end()
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// DELETE
app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'malformatted id' })
    }
    await Person.findByIdAndDelete(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// --- 3.16: tuntematon API-endpoint ---
const unknownEndpoint = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'unknown endpoint' })
  }
  next()
}
app.use(unknownEndpoint)

// --- 3.16: virheenkäsittely viimeisenä ---
const errorHandler = (error, _req, res, next) => {
  console.error(error.name, error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  return res.status(500).json({ error: 'internal server error' })
}
app.use(errorHandler)

// SPA fallback: muut kuin /api polut ohjataan index.html:ään
app.get('/*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// --- DB + serveri ---
const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('error connecting to MongoDB:', err.message)
    process.exit(1)
  })
