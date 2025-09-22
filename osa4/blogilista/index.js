// index.js
require('dotenv').config()
const http = require('http')
const mongoose = require('mongoose')
const { MONGODB_URI, PORT } = require('./utils/config')
const logger = require('./utils/logger')
const app = require('./app')

mongoose.set('strictQuery', false)

mongoose
  .connect(MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((err) => {
    logger.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

const server = http.createServer(app)

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
