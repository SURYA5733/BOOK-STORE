// Backend/models/Order.js
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  flatno: String,
  city: String,
  state: String,
  pincode: String,
  totalamount: Number,
  seller: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  BookingDate: String,
  description: String,
  Delivery: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  items: [{ 
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: String,
    price: Number,
    qty: { type: Number, default: 1 }
  }],
  status: { type: String, default: 'Placed' }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
