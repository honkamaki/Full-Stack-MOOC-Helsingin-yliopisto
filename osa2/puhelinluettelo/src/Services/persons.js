import axios from 'axios'
const baseUrl = 'http://localhost:3001/persons'

const getAll = () => axios.get(baseUrl).then(r => r.data)
const create = newPerson => axios.post(baseUrl, newPerson).then(r => r.data)
const update = (id, updatedPerson) => axios.put(`${baseUrl}/${id}`, updatedPerson).then(r => r.data)
const remove = id => axios.delete(`${baseUrl}/${id}`)

export default { getAll, create, update, remove }
