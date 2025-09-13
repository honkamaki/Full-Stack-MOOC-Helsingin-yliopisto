import axios from 'axios'

const baseUrl = 'http://localhost:3001/api/persons'

const getAll = () => axios.get(baseUrl).then(r => r.data)
const create = (newPerson) => axios.post(baseUrl, newPerson).then(r => r.data)
// Päivitys tehdään myöhemmin (3.17), voi olla valmiina mutta ei käytetä nyt:
const update = (id, updated) => axios.put(`${baseUrl}/${id}`, updated).then(r => r.data)
const remove = (id) => axios.delete(`${baseUrl}/${id}`)

export default { getAll, create, update, remove }
