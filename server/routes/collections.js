const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Collection = require('../models/Collection');
const Card = require('../models/Card');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// GET /api/collections - Get user's collections
router.get('/', authenticateToken, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.userId })
      .populate('category', 'name slug')
      .populate('items.card', 'name imageUrl marketData')
      .select('-__v')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collections'
    });
  }
});

// POST /api/collections - Create new collection
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, categoryId, isPublic } = req.body;

    const collection = new Collection({
      user: req.user.userId,
      name,
      description,
      category: categoryId,
      isPublic: isPublic || false
    });

    await collection.save();
    await collection.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      data: collection,
      message: 'Collection created successfully'
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collection'
    });
  }
});

// GET /api/collections/:id - Get specific collection
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('user', 'username profile.firstName profile.lastName')
      .populate('category', 'name slug')
      .populate({
        path: 'items.card',
        populate: {
          path: 'set',
          select: 'name slug'
        }
      })
      .populate('wishlist.card', 'name imageUrl marketData')
      .select('-__v');

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Check if collection is public or belongs to authenticated user
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isOwner = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        isOwner = collection.user._id.toString() === decoded.userId;
      } catch (err) {
        // Token invalid, continue as guest
      }
    }

    if (!collection.isPublic && !isOwner) {
      return res.status(403).json({
        success: false,
        error: 'This collection is private'
      });
    }

    res.json({
      success: true,
      data: collection,
      isOwner
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection'
    });
  }
});

// PUT /api/collections/:id - Update collection
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    if (name) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPublic !== undefined) collection.isPublic = isPublic;

    await collection.save();
    await collection.populate('category', 'name slug');

    res.json({
      success: true,
      data: collection,
      message: 'Collection updated successfully'
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update collection'
    });
  }
});

// POST /api/collections/:id/items - Add card to collection
router.post('/:id/items', authenticateToken, async (req, res) => {
  try {
    const { cardId, condition, quantity, purchasePrice, purchaseDate, notes } = req.body;

    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Verify card exists
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // Check if card already exists in collection with same condition
    const existingItem = collection.items.find(
      item => item.card.toString() === cardId && item.condition === condition
    );

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity || 1;
      if (purchasePrice) existingItem.purchasePrice = purchasePrice;
      if (purchaseDate) existingItem.purchaseDate = purchaseDate;
      if (notes) existingItem.notes = notes;
    } else {
      // Add new item
      collection.items.push({
        card: cardId,
        condition,
        quantity: quantity || 1,
        purchasePrice,
        purchaseDate,
        notes
      });
    }

    await collection.save();
    await collection.populate('items.card', 'name imageUrl marketData');

    res.json({
      success: true,
      data: collection,
      message: 'Card added to collection successfully'
    });
  } catch (error) {
    console.error('Error adding card to collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add card to collection'
    });
  }
});

// DELETE /api/collections/:id/items/:itemId - Remove card from collection
router.delete('/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    collection.items.id(req.params.itemId).remove();
    await collection.save();

    res.json({
      success: true,
      message: 'Card removed from collection successfully'
    });
  } catch (error) {
    console.error('Error removing card from collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove card from collection'
    });
  }
});

// POST /api/collections/:id/wishlist - Add card to wishlist
router.post('/:id/wishlist', authenticateToken, async (req, res) => {
  try {
    const { cardId, condition, maxPrice, priority, notes } = req.body;

    const collection = await Collection.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Check if card already in wishlist
    const existingWishlistItem = collection.wishlist.find(
      item => item.card.toString() === cardId && item.condition === condition
    );

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        error: 'Card already in wishlist'
      });
    }

    collection.wishlist.push({
      card: cardId,
      condition: condition || 'raw',
      maxPrice,
      priority: priority || 'medium',
      notes
    });

    await collection.save();
    await collection.populate('wishlist.card', 'name imageUrl marketData');

    res.json({
      success: true,
      data: collection,
      message: 'Card added to wishlist successfully'
    });
  } catch (error) {
    console.error('Error adding card to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add card to wishlist'
    });
  }
});

module.exports = router;
