// utils/config.js
const PORT = process.env.PORT || 3003
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist'

module.exports = { PORT, MONGODB_URI }
