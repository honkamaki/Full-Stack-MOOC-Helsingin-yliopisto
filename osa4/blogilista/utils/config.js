// utils/config.js
require('dotenv').config()

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

const PORT = process.env.PORT || 3003
const SECRET = process.env.SECRET || 'dev_secret_change_me'

module.exports = { MONGODB_URI, PORT, SECRET, NODE_ENV: process.env.NODE_ENV }
