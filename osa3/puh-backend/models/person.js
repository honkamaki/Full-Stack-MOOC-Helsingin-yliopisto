// puh-backend/models/person.js
import mongoose from 'mongoose'

const phoneValidator = {
  validator: function (v) {
    // Hyväksyy esim. 09-1234556 tai 040-22334455
    return /^\d{2,3}-\d+$/.test(v)
  },
  message: props => `${props.value} is not a valid phone number!`
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
    minlength: [8, 'Number must be at least 8 characters long'],
    validate: phoneValidator
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
//pushia varten muutos
