// Backend/models/User.js
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },     // added
  image: { type: String, default: '' },     // added (stores '/uploads/...' or external URL)
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
})

module.exports = mongoose.model('User', UserSchema)
