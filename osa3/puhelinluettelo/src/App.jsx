// puhelinluettelo/src/App.jsx
import { useEffect, useState } from 'react'
import personsService from './Services/persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState({ type: null, message: null })

  useEffect(() => {
    personsService.getAll()
      .then(setPersons)
      .catch(showError)
  }, [])

  const showMessage = (message) => {
    setNotification({ type: 'success', message })
    setTimeout(() => setNotification({ type: null, message: null }), 3000)
  }

  const showError = (error) => {
    const msg = error?.response?.data?.error || error?.message || 'Something went wrong'
    setNotification({ type: 'error', message: msg })
    setTimeout(() => setNotification({ type: null, message: null }), 4000)
  }

  const addPerson = async (e) => {
    e.preventDefault()
    const existing = persons.find(
      p => p.name.trim().toLowerCase() === newName.trim().toLowerCase()
    )

    // 3.17*: nimi on jo olemassa → PUT päivitys
    if (existing) {
      const ok = window.confirm(
        `${existing.name} is already added to phonebook, replace the old number with a new one?`
      )
      if (!ok) return
      try {
        const updated = await personsService.update(
          existing.id,
          { name: existing.name, number: newNumber }
        )
        setPersons(persons.map(p => p.id === existing.id ? updated : p))
        setNewName('')
        setNewNumber('')
        showMessage(`Updated ${updated.name}'s number`)
      } catch (err) {
        if (err?.response?.status === 404) {
          setPersons(persons.filter(p => p.id !== existing.id))
        }
        showError(err)
      }
      return
    }

    // Uusi henkilö
    try {
      const created = await personsService.create({ name: newName, number: newNumber })
      setPersons(persons.concat(created))
      setNewName('')
      setNewNumber('')
      showMessage(`Added ${created.name}`)
    } catch (err) {
      showError(err)
    }
  }

  const handleDelete = async (person) => {
    const ok = window.confirm(`Delete ${person.name}?`)
    if (!ok) return
    try {
      await personsService.remove(person.id)
      setPersons(persons.filter(p => p.id !== person.id))
      showMessage(`Deleted ${person.name}`)
    } catch (err) {
      if (err?.response?.status === 404) {
        setPersons(persons.filter(p => p.id !== person.id))
      }
      showError(err)
    }
  }

  const personsToShow = persons.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification type={notification.type} message={notification.message} />

      <div>
        filter shown with{' '}
        <input value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      <h3>Add a new</h3>
      <form onSubmit={addPerson}>
        <div>
          name:{' '}
          <input value={newName} onChange={e => setNewName(e.target.value)} />
        </div>
        <div>
          number:{' '}
          <input value={newNumber} onChange={e => setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h3>Numbers</h3>
      <ul>
        {personsToShow.map(person => (
          <li key={person.id}>
            {person.name} {person.number}{' '}
            <button onClick={() => handleDelete(person)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
//dist