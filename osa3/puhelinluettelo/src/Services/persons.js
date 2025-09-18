// src/services/persons.js
import axios from 'axios'

// Tuotannossa sama domain: /api/persons
// Devissä voit asettaa VITE_API_URL=.env.* jos haluat eri osoitteen.
const baseUrl = import.meta.env.VITE_API_URL ?? '/api/persons'

const getAll = () => axios.get(baseUrl).then(r => r.data)
const create = (newPerson) => axios.post(baseUrl, newPerson).then(r => r.data)
const update = (id, updated) => axios.put(`${baseUrl}/${id}`, updated).then(r => r.data)
const remove = (id) => axios.delete(`${baseUrl}/${id}`)

export default { getAll, create, update, remove }
