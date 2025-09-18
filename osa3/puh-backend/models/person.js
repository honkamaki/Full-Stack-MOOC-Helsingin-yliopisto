// puh-backend/models/person.js
import mongoose from 'mongoose'

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
  },
})

personSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.model('Person', personSchema)
