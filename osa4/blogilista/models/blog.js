// models/blog.js
const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: { type: Number, default: 0 },
  // 4.17: lisää blogille viittaus sen lisänneeseen käyttäjään
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ei pakollinen, jotta vanhat testit eivät kaadu
})

blogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  },
})

module.exports = mongoose.model('Blog', blogSchema)
