const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  set: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Set',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageUrlHiRes: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Universal card attributes - using Mixed type for flexibility
  attributes: mongoose.Schema.Types.Mixed,
  
  // Market data - using Mixed type for flexibility
  marketData: mongoose.Schema.Types.Mixed,

  // Import tracking fields
  sourceId: {
    type: String,
    default: null,
    index: true
  },
  sourceUrl: {
    type: String,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
cardSchema.index({ set: 1, cardNumber: 1 }, { unique: true });
cardSchema.index({ category: 1, name: 1 });
cardSchema.index({ slug: 1 });
cardSchema.index({ 'attributes.player': 1 }); // For sports cards
cardSchema.index({ 'attributes.type': 1 }); // For Pokemon
cardSchema.index({ rarity: 1 });
cardSchema.index({ isActive: 1 });

// Text search index
cardSchema.index({ 
  name: 'text', 
  'attributes.player': 'text',
  'attributes.artist': 'text'
});

module.exports = mongoose.model('Card', cardSchema);
