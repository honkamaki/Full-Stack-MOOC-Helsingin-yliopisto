// osa3/puh-backend/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'node:path'
import mongoose from 'mongoose'
import Person from './models/person.js'

const app = express()

// --- Yhteys MongoDB:hen ---
mongoose.set('strictQuery', false)
const mongoUrl = process.env.MONGODB_URI
if (!mongoUrl) {
  console.error('MONGODB_URI puuttuu ympäristömuuttujista')
  process.exit(1)
}
mongoose.connect(mongoUrl)
  .then(() => console.log('Yhteys MongoDB:hen ok'))
  .catch(err => {
    console.error('MongoDB-yhteysvirhe:', err.message)
    process.exit(1)
  })

// --- Middlewaret ---
app.use(express.static('dist')) // palvele frontin buildi
app.use(cors())
app.use(express.json())

morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// --- Reitit ---
// INFO hakee määrän tietokannasta
app.get('/info', async (_req, res, next) => {
  try {
    const count = await Person.countDocuments({})
    res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
  } catch (err) { next(err) }
})

// Hae kaikki henkilöt TIETOKANNASTA (3.13 step 1)
app.get('/api/persons', async (_req, res, next) => {
  try {
    const persons = await Person.find({})
    res.json(persons)
  } catch (err) { next(err) }
})

// (Valinnaista mutta pitää frontin lisäyksen toimivana)
// Lisää uusi henkilö TIETOKANTAAN
app.post('/api/persons', async (req, res, next) => {
  try {
    const { name, number } = req.body
    if (!name || !number) {
      return res.status(400).json({ error: 'name or number missing' })
    }
    const person = new Person({ name, number })
    const saved = await person.save()
    res.status(201).json(saved)
  } catch (err) { next(err) }
})

// Hae yksi id:llä (hyödyllinen jatkotehtäviin)
app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    if (!person) return res.status(404).end()
    res.json(person)
  } catch (err) { next(err) }
})

// Poista id:llä (hyödyllinen jatkotehtäviin)
app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (err) { next(err) }
})

// React catch-all: kaikki muut kuin /api/* palauttavat index.html:n
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.resolve('dist', 'index.html'))
})

// --- Virheenkäsittely ---
app.use((err, _req, res, _next) => {
  console.error(err.name, err.message)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  res.status(500).json({ error: 'something went wrong' })
})

// --- Käynnistys ---
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
//..pushia varten