import { useState, useEffect } from 'react'
import personsService from './services/persons'
import Notification from './components/Notification'

const Filter = ({ value, onChange }) => (
  <div>
    filter shown with <input value={value} onChange={onChange} />
  </div>
)

const PersonForm = ({ onSubmit, newName, onNameChange, newNumber, onNumberChange }) => (
  <form onSubmit={onSubmit}>
    <div>name: <input value={newName} onChange={onNameChange} /></div>
    <div>number: <input value={newNumber} onChange={onNumberChange} /></div>
    <button type="submit">add</button>
  </form>
)

const Person = ({ person, onDelete }) => (
  <li>
    {person.name} {person.number}{' '}
    <button onClick={() => onDelete(person.id, person.name)}>delete</button>
  </li>
)

const Persons = ({ persons, onDelete }) => (
  <ul>
    {persons.map(p => (
      <Person key={p.id ?? p.name} person={p} onDelete={onDelete} />
    ))}
  </ul>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState({ message: null, type: 'success' })

  useEffect(() => {
    personsService.getAll().then(data => setPersons(data))
  }, [])

  const showMessage = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type }), 5000)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const name = newName.trim()
    const number = newNumber.trim()
    if (!name) return

    const existing = persons.find(p => p.name.toLowerCase() === name.toLowerCase())

    if (existing) {
      if (window.confirm(`${existing.name} is already added to phonebook, replace the old number with a new one?`)) {
        const changed = { ...existing, number }
        personsService
          .update(existing.id, changed)
          .then(returned => {
            setPersons(persons.map(p => (p.id !== existing.id ? p : returned)))
            showMessage(`Updated number for ${returned.name}`)
            setNewName('')
            setNewNumber('')
          })
          .catch(() => {
            // Henkilö on poistettu palvelimelta toisessa selaimessa
            showMessage(`Information of ${existing.name} has already been removed from server`, 'error')
            setPersons(persons.filter(p => p.id !== existing.id))
          })
      }
      return
    }

    const newPerson = { name, number }
    personsService
      .create(newPerson)
      .then(returned => {
        setPersons(persons.concat(returned))
        showMessage(`Added ${returned.name}`)
        setNewName('')
        setNewNumber('')
      })
      .catch(() => {
        showMessage(`Failed to add ${name}`, 'error')
      })
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    personsService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
        showMessage(`Deleted ${name}`)
      })
      .catch(() => {
        // Jos toinen selain poisti jo
        showMessage(`Information of ${name} has already been removed from server`, 'error')
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  const personsToShow = persons.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification.message} type={notification.type} />

      <Filter value={filter} onChange={e => setFilter(e.target.value)} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={handleSubmit}
        newName={newName}
        onNameChange={e => setNewName(e.target.value)}
        newNumber={newNumber}
        onNumberChange={e => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} onDelete={handleDelete} />
    </div>
  )
}

export default App
