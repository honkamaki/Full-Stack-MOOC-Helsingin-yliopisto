import axios from 'axios'

// Käytä Vite-ympäristömuuttujaa jos se on asetettu,
// muuten käytä suhteellista polkua /api/persons
const baseUrl = import.meta.env.VITE_API_URL ?? '/api/persons'

const getAll = () => axios.get(baseUrl).then(r => r.data)
const create = newPerson => axios.post(baseUrl, newPerson).then(r => r.data)
const update = (id, updated) => axios.put(`${baseUrl}/${id}`, updated).then(r => r.data)
const remove = id => axios.delete(`${baseUrl}/${id}`)

export default { getAll, create, update, remove }
