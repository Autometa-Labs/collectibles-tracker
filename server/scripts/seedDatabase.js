const mongoose = require('mongoose');
const Category = require('../models/Category');
const Set = require('../models/Set');
const Card = require('../models/Card');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collectibles-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Category.deleteMany({});
    await Set.deleteMany({});
    await Card.deleteMany({});

    // Create Pokemon category
    const pokemonCategory = new Category({
      name: 'Pokemon',
      slug: 'pokemon',
      description: 'Pokemon Trading Card Game cards from all sets and generations',
      icon: '⚡',
      sortOrder: 1,
      metadata: {
        type: 'tcg',
        publisher: 'The Pokemon Company'
      }
    });
    await pokemonCategory.save();
    console.log('✓ Created Pokemon category');

    // Create sample Pokemon sets
    const baseSets = [
      {
        name: 'Base Set',
        slug: 'base-set',
        setCode: 'BS',
        releaseDate: new Date('1998-10-20'),
        totalCards: 102,
        description: 'The original Pokemon TCG set that started it all',
        isVintage: true,
        metadata: {
          series: 'Original Series',
          generation: 1,
          language: 'english'
        }
      },
      {
        name: 'Base Set 1st Edition',
        slug: 'base-set-1st-edition',
        setCode: 'BS1',
        releaseDate: new Date('1998-10-20'),
        totalCards: 102,
        description: 'First edition of the original Pokemon TCG set',
        isVintage: true,
        metadata: {
          series: 'Original Series',
          generation: 1,
          language: 'english',
          edition: '1st Edition'
        }
      },
      {
        name: 'Jungle',
        slug: 'jungle',
        setCode: 'JU',
        releaseDate: new Date('1999-06-16'),
        totalCards: 64,
        description: 'The second Pokemon TCG expansion set',
        isVintage: true,
        metadata: {
          series: 'Original Series',
          generation: 1,
          language: 'english'
        }
      },
      {
        name: 'Scarlet & Violet',
        slug: 'scarlet-violet',
        setCode: 'SVI',
        releaseDate: new Date('2023-03-31'),
        totalCards: 198,
        description: 'The latest Pokemon TCG base set',
        isVintage: false,
        metadata: {
          series: 'Scarlet & Violet Series',
          generation: 9,
          language: 'english'
        }
      }
    ];

    const createdSets = [];
    for (const setData of baseSets) {
      const set = new Set({
        ...setData,
        category: pokemonCategory._id
      });
      await set.save();
      createdSets.push(set);
      console.log(`✓ Created set: ${set.name}`);
    }

    // Create sample Pokemon cards
    const sampleCards = [
      // Base Set Cards
      {
        name: 'Charizard',
        slug: 'charizard-base-set-4',
        cardNumber: '4',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
        attributes: {
          type: ['Fire'],
          hp: 120,
          stage: 'Stage 2',
          attacks: [
            {
              name: 'Fire Spin',
              cost: ['Fire', 'Fire', 'Fire', 'Fire'],
              damage: '100',
              description: 'Discard 2 Energy cards attached to Charizard in order to use this attack.'
            }
          ],
          weakness: 'Water',
          retreatCost: 3,
          artist: 'Mitsuhiro Arita'
        },
        marketData: {
          averagePrice: {
            raw: 350.00,
            psa9: 2500.00,
            psa10: 8500.00
          },
          priceRange: {
            low: 200.00,
            high: 15000.00
          }
        }
      },
      {
        name: 'Blastoise',
        slug: 'blastoise-base-set-2',
        cardNumber: '2',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
        attributes: {
          type: ['Water'],
          hp: 100,
          stage: 'Stage 2',
          attacks: [
            {
              name: 'Hydro Pump',
              cost: ['Water', 'Water', 'Water'],
              damage: '40+',
              description: 'Does 40 damage plus 10 more damage for each Water Energy attached to Blastoise but not used to pay for this attack\'s Energy cost.'
            }
          ],
          weakness: 'Lightning',
          retreatCost: 3,
          artist: 'Ken Sugimori'
        },
        marketData: {
          averagePrice: {
            raw: 180.00,
            psa9: 1200.00,
            psa10: 4500.00
          },
          priceRange: {
            low: 100.00,
            high: 8000.00
          }
        }
      },
      {
        name: 'Venusaur',
        slug: 'venusaur-base-set-15',
        cardNumber: '15',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
        attributes: {
          type: ['Grass'],
          hp: 100,
          stage: 'Stage 2',
          attacks: [
            {
              name: 'Solarbeam',
              cost: ['Grass', 'Grass', 'Grass', 'Grass'],
              damage: '60',
              description: ''
            }
          ],
          weakness: 'Fire',
          retreatCost: 2,
          artist: 'Ken Sugimori'
        },
        marketData: {
          averagePrice: {
            raw: 120.00,
            psa9: 800.00,
            psa10: 2800.00
          },
          priceRange: {
            low: 80.00,
            high: 5000.00
          }
        }
      },
      {
        name: 'Pikachu',
        slug: 'pikachu-base-set-58',
        cardNumber: '58',
        rarity: 'Common',
        imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
        attributes: {
          type: ['Lightning'],
          hp: 40,
          stage: 'Basic',
          attacks: [
            {
              name: 'Thunder Jolt',
              cost: ['Lightning', 'Colorless'],
              damage: '30',
              description: 'Flip a coin. If tails, Pikachu does 10 damage to itself.'
            }
          ],
          weakness: 'Fighting',
          retreatCost: 1,
          artist: 'Mitsuhiro Arita'
        },
        marketData: {
          averagePrice: {
            raw: 25.00,
            psa9: 150.00,
            psa10: 450.00
          },
          priceRange: {
            low: 15.00,
            high: 800.00
          }
        }
      }
    ];

    // Add cards to Base Set
    const baseSet = createdSets[0];
    for (const cardData of sampleCards) {
      const card = new Card({
        ...cardData,
        set: baseSet._id,
        category: pokemonCategory._id
      });
      await card.save();
      console.log(`✓ Created card: ${card.name}`);
    }

    // Create additional categories for future expansion
    const additionalCategories = [
      {
        name: 'Magic: The Gathering',
        slug: 'magic-the-gathering',
        description: 'Magic: The Gathering trading cards from all sets',
        icon: '🔮',
        sortOrder: 2,
        isActive: false, // Not active yet
        metadata: {
          type: 'tcg',
          publisher: 'Wizards of the Coast'
        }
      },
      {
        name: 'NBA Cards',
        slug: 'nba-cards',
        description: 'National Basketball Association trading cards',
        icon: '🏀',
        sortOrder: 3,
        isActive: false,
        metadata: {
          type: 'sports',
          league: 'NBA'
        }
      },
      {
        name: 'One Piece',
        slug: 'one-piece',
        description: 'One Piece trading card game cards',
        icon: '🏴‍☠️',
        sortOrder: 4,
        isActive: false,
        metadata: {
          type: 'tcg',
          publisher: 'Bandai'
        }
      }
    ];

    for (const categoryData of additionalCategories) {
      const category = new Category(categoryData);
      await category.save();
      console.log(`✓ Created category: ${category.name} (inactive)`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`Created ${await Category.countDocuments()} categories`);
    console.log(`Created ${await Set.countDocuments()} sets`);
    console.log(`Created ${await Card.countDocuments()} cards`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedData();
