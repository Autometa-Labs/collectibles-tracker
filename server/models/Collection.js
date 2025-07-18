const mongoose = require('mongoose');

const collectionItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  purchasePrice: {
    type: Number,
    default: null
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  isForSale: {
    type: Boolean,
    default: false
  },
  askingPrice: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Collection'
  },
  description: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  items: [collectionItemSchema],
  
  // Calculated fields (updated via middleware)
  stats: {
    totalCards: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    totalInvested: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Wishlist items
  wishlist: [{
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true
    },
    condition: {
      type: String,
      enum: ['raw', 'psa9', 'psa10', 'bgs9', 'bgs10', 'cgc9', 'cgc10'],
      default: 'raw'
    },
    maxPrice: {
      type: Number,
      default: null
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    notes: String,
    addedDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Middleware to update stats when items change
collectionSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.stats.totalCards = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.stats.totalInvested = this.items.reduce((sum, item) => {
      return sum + (item.purchasePrice ? item.purchasePrice * item.quantity : 0);
    }, 0);
    this.stats.lastUpdated = new Date();
  }
  next();
});

// Indexes
collectionSchema.index({ user: 1 });
collectionSchema.index({ category: 1 });
collectionSchema.index({ isPublic: 1 });
collectionSchema.index({ 'items.card': 1 });
collectionSchema.index({ 'wishlist.card': 1 });

module.exports = mongoose.model('Collection', collectionSchema);
