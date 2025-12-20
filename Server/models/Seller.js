// Backend/models/Seller.js
const mongoose = require('mongoose')

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },   
  image: { type: String, default: '' },   
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller"
  }
})

module.exports = mongoose.model('Seller', SellerSchema)
