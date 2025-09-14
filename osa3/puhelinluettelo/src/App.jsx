import { useEffect, useState } from 'react'
import personsService from './services/persons'

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

  useEffect(() => {
    personsService.getAll().then(setPersons)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = newName.trim()
    const number = newNumber.trim()
    if (!name || !number) return

    const exists = persons.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      alert(`${name} is already added`)
      return
    }

    personsService.create({ name, number })
      .then(returned => {
        setPersons(persons.concat(returned))
        setNewName('')
        setNewNumber('')
      })
      .catch(err => {
        console.error(err)
        alert('Failed to add person')
      })
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    personsService.remove(id)
      .then(() => setPersons(persons.filter(p => p.id !== id)))
      .catch(err => {
        console.error(err)
        // jos palvelimella jo poistettu, siivotaan listasta
        setPersons(persons.filter(p => p.id !== id))
        alert(`Information of ${name} was already removed from server`)
      })
  }

  const personsToShow = persons.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

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
//kommentti pushia varten