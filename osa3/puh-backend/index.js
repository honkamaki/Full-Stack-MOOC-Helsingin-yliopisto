import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

const app = express()

// Palvele frontin tuotantoversio (dist-kansio backendin juuressa)
app.use(express.static('dist'))

app.use(cors())
app.use(express.json())

// Lokitus, näytä POST-body
morgan.token('body', (req) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// ---- API ----
let persons = [
  { id: 1, name: 'Arto Hellas', number: '040-123456' },
  { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
  { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
]

app.get('/info', (_req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (_req, res) => res.json(persons))

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
  if (!person) return res.status(404).end()
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!persons.some(p => p.id === id)) return res.status(404).end()
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body
  if (!name || !number) return res.status(400).json({ error: 'name or number missing' })
  if (persons.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: 'name must be unique' })
  }
  const newPerson = { id: Math.floor(Math.random() * 1_000_000_000), name, number }
  persons = persons.concat(newPerson)
  res.status(201).json(newPerson)
})

// React catch-all: palautetaan index.html muille kuin /api/* pyynnöille
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'dist' })
})

// Käynnistys (Render lukee portin envistä)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
