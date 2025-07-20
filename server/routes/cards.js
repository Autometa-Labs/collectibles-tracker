const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const SetModel = require('../models/Set');
const Category = require('../models/Category');

// GET /api/cards - Search and filter cards
router.get('/', async (req, res) => {
  try {
    const {
      category,
      set,
      search,
      rarity,
      type,
      player,
      page = 1,
      limit = 20,
      sort = 'name'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    if (set) {
      const setDoc = await SetModel.findOne({ slug: set });
      if (setDoc) {
        query.set = setDoc._id;
      }
    }
    
    if (rarity) {
      query.rarity = new RegExp(rarity, 'i');
    }
    
    if (type) {
      query['attributes.type'] = new RegExp(type, 'i');
    }
    
    if (player) {
      query['attributes.player'] = new RegExp(player, 'i');
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortObj = {};
    switch (sort) {
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'price-high':
        sortObj = { 'marketData.averagePrice.raw': -1 };
        break;
      case 'price-low':
        sortObj = { 'marketData.averagePrice.raw': 1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'cardNumber':
        sortObj = { cardNumber: 1 };
        break;
      default:
        sortObj = { name: 1 };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [cards, total] = await Promise.all([
      Card.find(query)
        .populate('set', 'name slug setCode')
        .populate('category', 'name slug')
        .select('-__v')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Card.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: cards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards'
    });
  }
});

// GET /api/cards/:id - Get card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('set', 'name slug setCode releaseDate imageUrl')
      .populate('category', 'name slug')
      .select('-__v');
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card'
    });
  }
});

// GET /api/cards/set/:setSlug - Get cards by set
router.get('/set/:setSlug', async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = 'cardNumber' } = req.query;
    
    const set = await SetModel.findOne({ slug: req.params.setSlug });
    if (!set) {
      return res.status(404).json({
        success: false,
        error: 'Set not found'
      });
    }
    
    let sortObj = {};
    switch (sort) {
      case 'cardNumber':
        sortObj = { cardNumber: 1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'rarity':
        sortObj = { rarity: 1, cardNumber: 1 };
        break;
      case 'price-high':
        sortObj = { 'marketData.averagePrice.raw': -1 };
        break;
      default:
        sortObj = { cardNumber: 1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [cards, total] = await Promise.all([
      Card.find({ set: set._id, isActive: true })
        .populate('category', 'name slug')
        .select('-__v')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Card.countDocuments({ set: set._id, isActive: true })
    ]);
    
    res.json({
      success: true,
      data: cards,
      set: {
        name: set.name,
        slug: set.slug,
        setCode: set.setCode,
        totalCards: set.totalCards
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching cards by set:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards'
    });
  }
});

// GET /api/cards/trending/hot - Get trending cards
router.get('/trending/hot', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    const query = { isActive: true };
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    // Get cards with recent price increases or high sales volume
    const cards = await Card.find(query)
      .populate('set', 'name slug')
      .populate('category', 'name slug')
      .sort({ 'marketData.salesVolume.weekly': -1, 'marketData.averagePrice.raw': -1 })
      .limit(parseInt(limit))
      .select('-__v');
    
    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Error fetching trending cards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending cards'
    });
  }
});

module.exports = router;
