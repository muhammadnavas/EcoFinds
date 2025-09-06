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
  // Review stats (calculated fields)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// Calculate review stats
productSchema.methods.calculateReviewStats = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].avgRating * 10) / 10; // Round to 1 decimal
    this.reviewCount = stats[0].count;
  } else {
    this.averageRating = 0;
    this.reviewCount = 0;
  }

  await this.save();
};module.exports = mongoose.model('Product', productSchema);
