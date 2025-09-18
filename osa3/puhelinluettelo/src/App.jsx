// src/App.jsx
import { useEffect, useState } from 'react'
import personsService from './Services/persons'

function App() {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [note, setNote] = useState(null)

  useEffect(() => {
    personsService.getAll().then(setPersons).catch(console.error)
  }, [])

  const notify = (type, text) => {
    setNote({ type, text })
    setTimeout(() => setNote(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const name = newName.trim()
    const number = newNumber.trim()
    if (!name || !number) return

    const existing = persons.find(
      p => p.name.trim().toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      const ok = window.confirm(
        `${name} on jo luettelossa, korvataanko vanha numero uudella?`
      )
      if (!ok) return
      try {
        const updated = await personsService.update(existing.id, { ...existing, number })
        setPersons(prev => prev.map(p => p.id === existing.id ? updated : p))
        setNewName('')
        setNewNumber('')
        notify('success', `Päivitetty: ${updated.name}`)
      } catch (err) {
        // Jos henkilö on poistettu kannasta -> siivoa lista
        if (err?.response?.status === 404) {
          setPersons(prev => prev.filter(p => p.id !== existing.id))
          notify('error', `Henkilö ${existing.name} oli jo poistettu palvelimelta`)
        } else {
          console.error(err)
          notify('error', 'Päivitys epäonnistui')
        }
      }
      return
    }

    try {
      const created = await personsService.create({ name, number })
      setPersons(prev => prev.concat(created))
      setNewName('')
      setNewNumber('')
      notify('success', `Lisätty: ${created.name}`)
    } catch (err) {
      console.error(err)
      notify('error', 'Lisäys epäonnistui')
    }
  }

  const handleDelete = async (id, name) => {
    const ok = window.confirm(`Poistetaanko ${name}?`)
    if (!ok) return
    try {
      await personsService.remove(id)
      setPersons(prev => prev.filter(p => p.id !== id))
      notify('success', `Poistettu: ${name}`)
    } catch (err) {
      if (err?.response?.status === 404) {
        setPersons(prev => prev.filter(p => p.id !== id))
        notify('error', `${name} oli jo poistettu palvelimelta`)
      } else {
        console.error(err)
        notify('error', 'Poisto epäonnistui')
      }
    }
  }

  return (
    <div className="container">
      <h1>Phonebook</h1>
      {note && <Notification type={note.type} message={note.text} />}

      <form onSubmit={handleSubmit}>
        <div>
          name: <input value={newName} onChange={e => setNewName(e.target.value)} />
        </div>
        <div>
          number: <input value={newNumber} onChange={e => setNewNumber(e.target.value)} />
        </div>
        <button type="submit">add</button>
      </form>

      <h2>Numbers</h2>
      <ul>
        {persons.map(p => (
          <li key={p.id}>
            {p.name} {p.number}{' '}
            <button onClick={() => handleDelete(p.id, p.name)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
