#!/usr/bin/env node

const mongoose = require('mongoose');
const PokemonImporter = require('./importers/PokemonImporter');
require('dotenv').config();

// Popular Pokemon sets to start with
const POPULAR_SETS = {
  'base1': 'Base Set',
  'jungle': 'Jungle',
  'fossil': 'Fossil',
  'base2': 'Base Set 2',
  'teamrocket': 'Team Rocket',
  'gym1': 'Gym Heroes',
  'gym2': 'Gym Challenge',
  'neo1': 'Neo Genesis',
  'neo2': 'Neo Discovery',
  'neo3': 'Neo Destiny'
};

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    sets: [],
    listSets: false,
    listImported: false,
    cleanup: false,
    all: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--sets':
        if (i + 1 < args.length) {
          options.sets = args[i + 1].split(',').map(s => s.trim());
          i++; // Skip next argument as it's the value
        }
        break;
      case '--list':
        options.listSets = true;
        break;
      case '--imported':
        options.listImported = true;
        break;
      case '--cleanup':
        options.cleanup = true;
        break;
      case '--all':
        options.all = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        // If it doesn't start with --, treat as set IDs
        if (!arg.startsWith('--')) {
          options.sets = arg.split(',').map(s => s.trim());
        }
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Pokemon Card Importer

USAGE:
  node server/scripts/importPokemon.js [OPTIONS]

OPTIONS:
  --sets <set1,set2>    Import specific sets (comma-separated)
  --list               List all available sets from Pokemon TCG API
  --imported           List currently imported sets in the database
  --cleanup            Remove problematic/empty duplicate sets from database
  --all                Import all available sets (use with caution!)
  --help, -h           Show this help message

EXAMPLES:
  # Import Base Set, Jungle, and Fossil
  node server/scripts/importPokemon.js --sets base1,jungle,fossil

  # Import just Base Set
  node server/scripts/importPokemon.js --sets base1

  # List all available sets
  node server/scripts/importPokemon.js --list

  # List currently imported sets
  node server/scripts/importPokemon.js --imported

  # Import popular vintage sets (recommended for testing)
  node server/scripts/importPokemon.js --sets base1,jungle,fossil

POPULAR SET IDs:
  base1      - Base Set (102 cards)
  jungle     - Jungle (64 cards)
  fossil     - Fossil (62 cards)
  base2      - Base Set 2 (130 cards)
  teamrocket - Team Rocket (83 cards)
  gym1       - Gym Heroes (132 cards)
  gym2       - Gym Challenge (132 cards)
  neo1       - Neo Genesis (111 cards)
  neo2       - Neo Discovery (75 cards)
  neo3       - Neo Destiny (105 cards)

NOTE: 
  - The importer will skip cards that already exist in the database
  - Large imports may take several minutes due to API rate limiting
  - Use --sets with a few sets first to test the functionality
`);
}

/**
 * Connect to MongoDB
 */
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/collectibles-tracker';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

/**
 * List all available Pokemon sets
 */
async function listAvailableSets() {
  try {
    const importer = new PokemonImporter();
    const sets = await importer.getAvailableSets();
    
    console.log('\nAvailable Pokemon Sets:');
    console.log('='.repeat(80));
    console.log('ID'.padEnd(15) + 'Name'.padEnd(35) + 'Series'.padEnd(20) + 'Cards');
    console.log('-'.repeat(80));
    
    sets.forEach(set => {
      const id = set.id.padEnd(15);
      const name = (set.name || 'Unknown').padEnd(35);
      const series = (set.series || 'Unknown').padEnd(20);
      const total = set.total || '?';
      console.log(`${id}${name}${series}${total}`);
    });
    
    console.log('-'.repeat(80));
    console.log(`Total: ${sets.length} sets available`);
    
  } catch (error) {
    console.error('❌ Error listing sets:', error.message);
    process.exit(1);
  }
}

/**
 * List currently imported Pokemon sets from the database
 */
async function listImportedSets() {
  try {
    const Set = require('../models/Set');
    const Category = require('../models/Category');
    const Card = require('../models/Card');
    
    // Find Pokemon category
    const pokemonCategory = await Category.findOne({ slug: 'pokemon' });
    if (!pokemonCategory) {
      console.log('\n❌ Pokemon category not found in database.');
      console.log('Make sure you have imported some Pokemon sets first.');
      return;
    }
    
    // Get all Pokemon sets with card counts
    const sets = await Set.aggregate([
      { $match: { category: pokemonCategory._id } },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'set',
          as: 'cards'
        }
      },
      {
        $addFields: {
          cardCount: { $size: '$cards' }
        }
      },
      {
        $project: {
          name: 1,
          setCode: 1,
          releaseDate: 1,
          totalCards: 1,
          cardCount: 1,
          'metadata.series': 1,
          createdAt: 1
        }
      },
      { $sort: { releaseDate: 1 } }
    ]);
    
    if (sets.length === 0) {
      console.log('\n📦 No Pokemon sets found in database.');
      console.log('Use --sets to import some sets first.');
      return;
    }
    
    console.log('\nCurrently Imported Pokemon Sets:');
    console.log('='.repeat(85));
    console.log('Set Code'.padEnd(12) + 'Name'.padEnd(30) + 'Series'.padEnd(20) + 'Cards'.padEnd(8) + 'Imported');
    console.log('-'.repeat(85));
    
    sets.forEach(set => {
      const setCode = (set.setCode || 'Unknown').padEnd(12);
      const name = (set.name || 'Unknown').padEnd(30);
      const series = (set.metadata?.series || 'Unknown').padEnd(20);
      const cardCount = `${set.cardCount}/${set.totalCards || '?'}`.padEnd(8);
      const importedDate = set.createdAt ? set.createdAt.toISOString().split('T')[0] : 'Unknown';
      
      console.log(`${setCode}${name}${series}${cardCount}${importedDate}`);
    });
    
    console.log('-'.repeat(85));
    console.log(`Total: ${sets.length} sets imported`);
    
    // Summary statistics
    const totalCards = sets.reduce((sum, set) => sum + set.cardCount, 0);
    const totalExpected = sets.reduce((sum, set) => sum + (set.totalCards || 0), 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   • ${totalCards} cards imported`);
    if (totalExpected > 0) {
      console.log(`   • ${totalExpected} cards expected`);
      console.log(`   • ${((totalCards / totalExpected) * 100).toFixed(1)}% completion rate`);
    }
    
  } catch (error) {
    console.error('❌ Error listing imported sets:', error.message);
    process.exit(1);
  }
}

/**
 * Clean up problematic/empty duplicate sets from the database
 */
async function cleanupProblematicSets() {
  try {
    const Set = require('../models/Set');
    const Category = require('../models/Category');
    const Card = require('../models/Card');
    
    console.log('Pokemon Database Cleanup');
    console.log('='.repeat(50));
    
    // Find Pokemon category
    const pokemonCategory = await Category.findOne({ slug: 'pokemon' });
    if (!pokemonCategory) {
      console.log('❌ Pokemon category not found in database.');
      return;
    }
    
    // Define problematic sets to remove (based on our analysis)
    const problematicSetCodes = ['BS', 'BS1', 'JU', 'SVI'];
    
    console.log('Identifying problematic sets to remove...');
    console.log(`Target set codes: ${problematicSetCodes.join(', ')}`);
    
    let totalSetsRemoved = 0;
    let totalCardsRemoved = 0;
    
    for (const setCode of problematicSetCodes) {
      try {
        // Find the set
        const set = await Set.findOne({ 
          setCode: setCode, 
          category: pokemonCategory._id 
        });
        
        if (!set) {
          console.log(`  Set ${setCode}: Not found (already removed or doesn't exist)`);
          continue;
        }
        
        // Count cards in this set
        const cardCount = await Card.countDocuments({ set: set._id });
        
        console.log(`  Set ${setCode} (${set.name}): Found ${cardCount} cards`);
        
        // Remove all cards in this set
        if (cardCount > 0) {
          const cardDeleteResult = await Card.deleteMany({ set: set._id });
          console.log(`    ✓ Removed ${cardDeleteResult.deletedCount} cards`);
          totalCardsRemoved += cardDeleteResult.deletedCount;
        }
        
        // Remove the set itself
        await Set.deleteOne({ _id: set._id });
        console.log(`    ✓ Removed set ${setCode}`);
        totalSetsRemoved++;
        
      } catch (error) {
        console.error(`  ❌ Error removing set ${setCode}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`Sets removed: ${totalSetsRemoved}`);
    console.log(`Cards removed: ${totalCardsRemoved}`);
    console.log('='.repeat(50));
    
    if (totalSetsRemoved > 0) {
      console.log('\n🎉 Cleanup completed successfully!');
      console.log('Run --imported to see the updated database status.');
    } else {
      console.log('\n✓ No problematic sets found to remove.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

/**
 * Import Pokemon sets
 */
async function importPokemonSets(setIds) {
  try {
    if (!setIds || setIds.length === 0) {
      console.log('No sets specified. Use --help for usage information.');
      return;
    }

    console.log('Pokemon Card Importer');
    console.log('='.repeat(50));
    console.log(`Target sets: ${setIds.join(', ')}`);
    
    // Show set names if they're in our popular sets list
    const setNames = setIds.map(id => POPULAR_SETS[id] || id);
    console.log(`Set names: ${setNames.join(', ')}`);
    console.log('');

    const importer = new PokemonImporter();
    const stats = await importer.importSets(setIds);
    
    // Final summary
    console.log('\n🎉 Import completed!');
    if (stats.cardsImported > 0) {
      console.log(`Successfully imported ${stats.cardsImported} new Pokemon cards.`);
    }
    if (stats.cardsSkipped > 0) {
      console.log(`Skipped ${stats.cardsSkipped} cards that already existed.`);
    }
    
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArguments();

  // Show help
  if (options.help) {
    showHelp();
    return;
  }

  // Connect to database
  await connectToDatabase();

  try {
    // List available sets
    if (options.listSets) {
      await listAvailableSets();
      return;
    }

    // List imported sets
    if (options.listImported) {
      await listImportedSets();
      return;
    }

    // Cleanup problematic sets
    if (options.cleanup) {
      await cleanupProblematicSets();
      return;
    }

    // Import all sets (dangerous!)
    if (options.all) {
      console.log('⚠️  WARNING: Importing ALL Pokemon sets may take hours and import thousands of cards!');
      console.log('Consider using --sets with specific set IDs instead.');
      console.log('Use Ctrl+C to cancel, or wait 10 seconds to continue...');
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const importer = new PokemonImporter();
      const allSets = await importer.getAvailableSets();
      const allSetIds = allSets.map(set => set.id);
      await importPokemonSets(allSetIds);
      return;
    }

    // Import specific sets
    if (options.sets.length > 0) {
      await importPokemonSets(options.sets);
      return;
    }

    // Default: show help if no options provided
    console.log('No import options specified. Use --help for usage information.');
    console.log('\nQuick start:');
    console.log('  node server/scripts/importPokemon.js --sets base1,jungle,fossil');

  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Import interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (error) => {
  console.error('❌ Unhandled rejection:', error);
  await mongoose.connection.close();
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(async (error) => {
    console.error('❌ Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  });
}

module.exports = { main, parseArguments, connectToDatabase };
