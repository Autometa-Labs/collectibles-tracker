const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['raw', 'psa9', 'psa10', 'bgs9', 'bgs10', 'cgc9', 'cgc10']
  },
  price: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    required: true,
    enum: ['ebay', 'tcgplayer', 'comc', 'pwcc', 'goldin', 'manual']
  },
  saleDate: {
    type: Date,
    required: true
  },
  listingUrl: {
    type: String,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  metadata: {
    // Additional sale information
    seller: String,
    buyerPremium: Number,
    shippingCost: Number,
    totalCost: Number,
    auctionType: String, // 'auction', 'buy_it_now', 'best_offer'
    additional: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient price queries
priceHistorySchema.index({ card: 1, condition: 1, saleDate: -1 });
priceHistorySchema.index({ saleDate: -1 });
priceHistorySchema.index({ source: 1, saleDate: -1 });
priceHistorySchema.index({ verified: 1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
