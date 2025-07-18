# Collectibles Tracker

A comprehensive platform for tracking collectible card values and managing personal collections. Starting with Pokemon cards and designed to expand to Magic: The Gathering, sports cards, and other collectibles.

## 🚀 Features

### Current (Pokemon Focus)
- **Card Database**: Comprehensive Pokemon card database with sets, rarities, and market data
- **Price Tracking**: Real-time price tracking across multiple conditions (Raw, PSA 9/10, BGS 9/10)
- **Collection Management**: Personal collection tracking with purchase prices and portfolio values
- **Wishlist System**: Track cards you want to acquire with price alerts
- **Search & Filter**: Advanced search by set, rarity, type, and more
- **User Authentication**: Secure user accounts with JWT authentication
- **Public/Private Collections**: Share collections publicly or keep them private

### Planned Features
- **Multi-Category Support**: Magic: The Gathering, NBA/MLB cards, One Piece, etc.
- **Price Alerts**: Email notifications when cards hit target prices
- **Market Analytics**: Price trends, hot cards, market insights
- **Trading System**: Connect with other collectors for trades
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Portfolio performance, ROI tracking

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API** with comprehensive endpoints
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for secure user sessions
- **Scalable Database Schema** designed for multi-category expansion
- **Price History Tracking** with market data aggregation

### Database Models
- **Categories**: Pokemon, MTG, Sports Cards, etc.
- **Sets**: Card sets/expansions within each category
- **Cards**: Individual cards with attributes and market data
- **Users**: User accounts with preferences and subscriptions
- **Collections**: Personal card collections with tracking
- **PriceHistory**: Historical price data from multiple sources

### API Endpoints
```
/api/categories     - Card categories (Pokemon, MTG, etc.)
/api/sets          - Card sets and expansions
/api/cards         - Individual cards with search/filter
/api/prices        - Price history and market data
/api/users         - User authentication and profiles
/api/collections   - Personal collection management
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd collectibles-tracker
npm run install-all
```

2. **Environment Configuration**
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

4. **Seed the database**
```bash
cd server
npm run seed
```

5. **Start the development server**
```bash
# From root directory
npm run dev

# Or start backend only
cd server
npm run dev
```

The API will be available at `http://localhost:5000`

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/collectibles-tracker
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

## 📊 Database Schema

### Categories
```javascript
{
  name: "Pokemon",
  slug: "pokemon",
  description: "Pokemon Trading Card Game cards",
  isActive: true,
  sortOrder: 1,
  metadata: { type: "tcg", publisher: "The Pokemon Company" }
}
```

### Cards
```javascript
{
  name: "Charizard",
  set: ObjectId,
  category: ObjectId,
  cardNumber: "4",
  rarity: "Rare Holo",
  attributes: {
    type: ["Fire"],
    hp: 120,
    stage: "Stage 2",
    attacks: [...],
    artist: "Mitsuhiro Arita"
  },
  marketData: {
    averagePrice: { raw: 350, psa10: 8500 },
    priceRange: { low: 200, high: 15000 }
  }
}
```

## 🔌 API Usage Examples

### Get Pokemon Cards
```bash
GET /api/cards?category=pokemon&rarity=rare&sort=price-high
```

### Search Cards
```bash
GET /api/cards?search=charizard&category=pokemon
```

### Get Card Price History
```bash
GET /api/prices/card/[cardId]?condition=psa10&days=30
```

### User Registration
```bash
POST /api/users/register
{
  "username": "collector123",
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Add Card to Collection
```bash
POST /api/collections/[collectionId]/items
Authorization: Bearer [jwt-token]
{
  "cardId": "card-object-id",
  "condition": "raw",
  "quantity": 1,
  "purchasePrice": 350.00
}
```

## 🎯 Roadmap

### Phase 1: Pokemon Foundation ✅
- [x] Core API structure
- [x] Pokemon card database
- [x] User authentication
- [x] Collection management
- [x] Basic price tracking

### Phase 2: Enhanced Features
- [ ] Frontend React application
- [ ] Advanced search and filtering
- [ ] Price alerts and notifications
- [ ] Market analytics dashboard
- [ ] Public collection sharing

### Phase 3: Multi-Category Expansion
- [ ] Magic: The Gathering integration
- [ ] Sports cards (NBA, MLB, NFL)
- [ ] One Piece TCG
- [ ] Universal card attributes system

### Phase 4: Advanced Platform
- [ ] Mobile application
- [ ] Trading marketplace
- [ ] Advanced portfolio analytics
- [ ] Social features and community

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Pokemon TCG API for card data inspiration
- PokeData.io for market research
- The collectibles community for feedback and requirements

---

**Built with ❤️ for collectors, by collectors**
