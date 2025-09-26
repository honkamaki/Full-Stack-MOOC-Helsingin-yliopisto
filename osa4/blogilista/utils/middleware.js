const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { SECRET } = require('./config')

const unknownEndpoint = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'unknown endpoint' })
  }
  next()
}

const errorHandler = (err, _req, res, _next) => {
  logger.error(err.name, err.message)

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' })
  }

  return res.status(500).json({ error: 'server error' })
}

// 4.19: Tokenin ja käyttäjän erottaminen
const tokenExtractor = (req, _res, next) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.substring(7)
  } else {
    req.token = null
  }
  next()
}

const userExtractor = async (req, _res, next) => {
  try {
    if (req.token) {
      const decoded = jwt.verify(req.token, SECRET)
      if (decoded?.id) {
        req.user = await User.findById(decoded.id)
      }
    }
  } catch (err) {
    return next(err)
  }
  next()
}

module.exports = { unknownEndpoint, errorHandler, tokenExtractor, userExtractor }
