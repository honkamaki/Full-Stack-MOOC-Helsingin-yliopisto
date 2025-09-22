// app.js
const express = require('express')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

// (valinnainen) 404 API:lle
app.use(middleware.unknownEndpoint)
// virheenkäsittely
app.use(middleware.errorHandler)

module.exports = app
