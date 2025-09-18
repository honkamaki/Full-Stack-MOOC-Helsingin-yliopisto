// puhelinluettelo/src/Services/persons.js
import axios from 'axios'

const baseUrl = '/api/persons'

const getAll = async () => {
  const res = await axios.get(baseUrl)
  return res.data
}

const create = async (newPerson) => {
  const res = await axios.post(baseUrl, newPerson)
  return res.data
}

const update = async (id, updated) => {
  const res = await axios.put(`${baseUrl}/${id}`, updated)
  return res.data
}

const remove = async (id) => {
  await axios.delete(`${baseUrl}/${id}`)
}

export default { getAll, create, update, remove }
