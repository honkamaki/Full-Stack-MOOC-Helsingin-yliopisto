// utils/config.js
require('dotenv').config()

const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 3003

const MONGODB_URI =
  NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

module.exports = { NODE_ENV, PORT, MONGODB_URI }
