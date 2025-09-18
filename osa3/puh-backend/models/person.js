// osa3/puh-backend/models/person.js
import mongoose from 'mongoose'

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
})

personSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

export default mongoose.model('Person', personSchema)
