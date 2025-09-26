// index.js
const http = require('http')
const mongoose = require('mongoose')
const { MONGODB_URI, PORT } = require('./utils/config')
const app = require('./app')

mongoose.set('strictQuery', false)

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
