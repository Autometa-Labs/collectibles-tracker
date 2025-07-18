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
  // Universal card attributes
  attributes: {
    // Pokemon-specific
    type: [String], // Fire, Water, etc.
    hp: Number,
    stage: String, // Basic, Stage 1, etc.
    attacks: [{
      name: String,
      cost: [String],
      damage: String,
      description: String
    }],
    weakness: String,
    resistance: String,
    retreatCost: Number,
    artist: String,
    
    // Sports card specific
    player: String,
    team: String,
    position: String,
    rookie: Boolean,
    autograph: Boolean,
    jersey: Boolean,
    
    // MTG specific
    manaCost: String,
    cmc: Number, // Converted mana cost
    colors: [String],
    cardType: String,
    subTypes: [String],
    power: String,
    toughness: String,
    
    // Flexible additional attributes
    additional: mongoose.Schema.Types.Mixed
  },
  
  // Market data
  marketData: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    averagePrice: {
      raw: Number,
      psa9: Number,
      psa10: Number,
      bgs9: Number,
      bgs10: Number
    },
    priceRange: {
      low: Number,
      high: Number
    },
    salesVolume: {
      daily: Number,
      weekly: Number,
      monthly: Number
    }
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
