const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: {
    type: String,
    default: 'Anonymous',
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Product+Image',
  },
  images: {
    type: [String],
    default: function() {
      return [this.imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image'];
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});module.exports = mongoose.model('Product', productSchema);
