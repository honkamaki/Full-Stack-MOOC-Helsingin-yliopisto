// utils/middleware.js
const logger = require('./logger')

const unknownEndpoint = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'unknown endpoint' })
  }
  next()
}

const errorHandler = (err, _req, res, _next) => {
  logger.error(err.name, err.message)
  return res.status(500).json({ error: 'server error' })
}

module.exports = { unknownEndpoint, errorHandler }
