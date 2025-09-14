// osa3/puh-backend/models/person.js
import mongoose from 'mongoose'

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
})

// Muunna MongoDB:n _id => id ja poista __v vastauksista
personSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  }
})

const Person = mongoose.model('Person', personSchema)
export default Person
