const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  setCode: {
    type: String,
    required: true,
    uppercase: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  totalCards: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: null
  },
  isVintage: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    // Category-specific data (e.g., for Pokemon: series, generation)
    series: String,
    generation: Number,
    language: {
      type: String,
      default: 'english'
    },
    // For sports cards: league, season, etc.
    league: String,
    season: String,
    // Flexible additional data
    additional: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
setSchema.index({ category: 1, releaseDate: -1 });
setSchema.index({ category: 1, slug: 1 });
setSchema.index({ setCode: 1, category: 1 }, { unique: true });
setSchema.index({ isActive: 1, isVintage: 1 });

module.exports = mongoose.model('Set', setSchema);
