// Backend/models/Book.js
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
})

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  genre: String,
  description: String,
  price: { type: Number, default: 0 },
  stockQty: { type: Number, default: 0 },
  coverImageFile: String,   // server path or URL
  coverImageLink: String,   // external link
  pdfFile: String,          // server path
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // owner (seller) id
  userName: String, // owner name for convenience
  rating: { type: Number, default: 0 }, // average rating
  reviews: [reviewSchema]
}, { timestamps: true })

module.exports = mongoose.model('Book', bookSchema)
