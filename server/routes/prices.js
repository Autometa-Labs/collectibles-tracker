const express = require('express');
const router = express.Router();
const PriceHistory = require('../models/PriceHistory');
const Card = require('../models/Card');

// GET /api/prices/card/:cardId - Get price history for a card
router.get('/card/:cardId', async (req, res) => {
  try {
    const { condition = 'raw', days = 30, source } = req.query;
    
    // Build query
    const query = { card: req.params.cardId };
    
    if (condition) {
      query.condition = condition;
    }
    
    if (source) {
      query.source = source;
    }
    
    // Date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.saleDate = { $gte: startDate };
    
    const priceHistory = await PriceHistory.find(query)
      .sort({ saleDate: -1 })
      .select('-__v')
      .limit(100);
    
    // Calculate statistics
    const prices = priceHistory.map(p => p.price);
    const stats = {
      count: prices.length,
      average: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      latest: prices.length > 0 ? prices[0] : 0
    };
    
    res.json({
      success: true,
      data: priceHistory,
      stats,
      filters: {
        condition,
        days: parseInt(days),
        source
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price history'
    });
  }
});

// GET /api/prices/trending - Get trending price movements
router.get('/trending', async (req, res) => {
  try {
    const { category, direction = 'up', limit = 20 } = req.query;
    
    // This would require more complex aggregation to calculate price trends
    // For now, return cards with recent high-value sales
    const query = {};
    if (category) {
      // Would need to join with Card model to filter by category
    }
    
    const sortDirection = direction === 'up' ? -1 : 1;
    
    const trendingPrices = await PriceHistory.find(query)
      .populate({
        path: 'card',
        populate: {
          path: 'set category',
          select: 'name slug'
        }
      })
      .sort({ price: sortDirection, saleDate: -1 })
      .limit(parseInt(limit))
      .select('-__v');
    
    res.json({
      success: true,
      data: trendingPrices
    });
  } catch (error) {
    console.error('Error fetching trending prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending prices'
    });
  }
});

// POST /api/prices - Add new price data (admin/scraper only)
router.post('/', async (req, res) => {
  try {
    const {
      cardId,
      condition,
      price,
      source,
      saleDate,
      listingUrl,
      metadata
    } = req.body;
    
    // Validate card exists
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }
    
    const priceEntry = new PriceHistory({
      card: cardId,
      condition,
      price,
      source,
      saleDate: saleDate || new Date(),
      listingUrl,
      metadata: metadata || {}
    });
    
    await priceEntry.save();
    
    // Update card's market data
    await updateCardMarketData(cardId);
    
    res.status(201).json({
      success: true,
      data: priceEntry,
      message: 'Price data added successfully'
    });
  } catch (error) {
    console.error('Error adding price data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add price data'
    });
  }
});

// Helper function to update card market data
async function updateCardMarketData(cardId) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get recent prices for different conditions
    const conditions = ['raw', 'psa9', 'psa10'];
    const marketData = {
      lastUpdated: new Date(),
      averagePrice: {},
      priceRange: { low: 0, high: 0 }
    };
    
    for (const condition of conditions) {
      const prices = await PriceHistory.find({
        card: cardId,
        condition,
        saleDate: { $gte: thirtyDaysAgo }
      }).select('price');
      
      if (prices.length > 0) {
        const priceValues = prices.map(p => p.price);
        marketData.averagePrice[condition] = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
        
        if (condition === 'raw') {
          marketData.priceRange.low = Math.min(...priceValues);
          marketData.priceRange.high = Math.max(...priceValues);
        }
      }
    }
    
    await Card.findByIdAndUpdate(cardId, { marketData });
  } catch (error) {
    console.error('Error updating card market data:', error);
  }
}

module.exports = router;
