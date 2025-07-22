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
  --all                Import all available sets (use with caution!)
  --help, -h           Show this help message

EXAMPLES:
  # Import Base Set, Jungle, and Fossil
  node server/scripts/importPokemon.js --sets base1,jungle,fossil

  # Import just Base Set
  node server/scripts/importPokemon.js --sets base1

  # List all available sets
  node server/scripts/importPokemon.js --list

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
