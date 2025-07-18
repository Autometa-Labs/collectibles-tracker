const express = require('express');
const router = express.Router();
const Set = require('../models/Set');
const Category = require('../models/Category');

// GET /api/sets - Get sets with filtering
router.get('/', async (req, res) => {
  try {
    const {
      category,
      vintage,
      language = 'english',
      page = 1,
      limit = 20,
      sort = 'releaseDate'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }
    
    if (vintage !== undefined) {
      query.isVintage = vintage === 'true';
    }
    
    if (language) {
      query['metadata.language'] = language;
    }

    // Build sort
    let sortObj = {};
    switch (sort) {
      case 'releaseDate':
        sortObj = { releaseDate: -1 };
        break;
      case 'releaseDate-asc':
        sortObj = { releaseDate: 1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'totalCards':
        sortObj = { totalCards: -1 };
        break;
      default:
        sortObj = { releaseDate: -1 };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [sets, total] = await Promise.all([
      Set.find(query)
        .populate('category', 'name slug')
        .select('-__v')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Set.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: sets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching sets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sets'
    });
  }
});

// GET /api/sets/:slug - Get set by slug
router.get('/:slug', async (req, res) => {
  try {
    const set = await Set.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .select('-__v');
    
    if (!set) {
      return res.status(404).json({
        success: false,
        error: 'Set not found'
      });
    }
    
    res.json({
      success: true,
      data: set
    });
  } catch (error) {
    console.error('Error fetching set:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch set'
    });
  }
});

// GET /api/sets/category/:categorySlug - Get sets by category
router.get('/category/:categorySlug', async (req, res) => {
  try {
    const { vintage, limit = 50, sort = 'releaseDate' } = req.query;
    
    const category = await Category.findOne({ slug: req.params.categorySlug });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    const query = { category: category._id, isActive: true };
    
    if (vintage !== undefined) {
      query.isVintage = vintage === 'true';
    }
    
    let sortObj = {};
    switch (sort) {
      case 'releaseDate':
        sortObj = { releaseDate: -1 };
        break;
      case 'releaseDate-asc':
        sortObj = { releaseDate: 1 };
        break;
      case 'name':
        sortObj = { name: 1 };
        break;
      default:
        sortObj = { releaseDate: -1 };
    }
    
    const sets = await Set.find(query)
      .select('-__v')
      .sort(sortObj)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: sets,
      category: {
        name: category.name,
        slug: category.slug
      }
    });
  } catch (error) {
    console.error('Error fetching sets by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sets'
    });
  }
});

module.exports = router;
