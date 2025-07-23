const pokemon = require('pokemontcgsdk');
const mongoose = require('mongoose');
const Category = require('../../models/Category');
const SetModel = require('../../models/Set');
const Card = require('../../models/Card');
const DataMapper = require('./DataMapper');

class PokemonImporter {
  constructor() {
    this.pokemonCategory = null;
    this.importedSets = new Map(); // Cache for imported sets
    this.stats = {
      setsImported: 0,
      cardsImported: 0,
      cardsSkipped: 0,
      errors: []
    };
  }

  /**
   * Initialize the Pokemon category in the database
   * @returns {Promise<Object>} Pokemon category object
   */
  async initializePokemonCategory() {
    try {
      // Check if Pokemon category already exists
      let pokemonCategory = await Category.findOne({ slug: 'pokemon' });
      
      if (!pokemonCategory) {
        console.log('Creating Pokemon category...');
        pokemonCategory = new Category({
          name: 'Pokemon',
          slug: 'pokemon',
          description: 'Pokemon Trading Card Game cards from all sets and generations',
          icon: '⚡',
          sortOrder: 1,
          isActive: true,
          metadata: {
            type: 'tcg',
            publisher: 'The Pokemon Company'
          }
        });
        await pokemonCategory.save();
        console.log('✓ Pokemon category created');
      } else {
        console.log('✓ Pokemon category already exists');
      }

      this.pokemonCategory = pokemonCategory;
      return pokemonCategory;
    } catch (error) {
      console.error('Error initializing Pokemon category:', error);
      throw error;
    }
  }

  /**
   * Import specific Pokemon sets by their IDs
   * @param {Array<String>} setIds - Array of Pokemon set IDs (e.g., ['base1', 'jungle', 'fossil'])
   * @returns {Promise<Object>} Import statistics
   */
  async importSets(setIds) {
    try {
      console.log(`Starting import of ${setIds.length} Pokemon sets...`);
      
      // Initialize Pokemon category
      await this.initializePokemonCategory();

      for (const setId of setIds) {
        try {
          await this.importSingleSet(setId);
        } catch (error) {
          console.error(`Error importing set ${setId}:`, error.message);
          this.stats.errors.push(`Set ${setId}: ${error.message}`);
        }
      }

      this.printImportSummary();
      return this.stats;
    } catch (error) {
      console.error('Error during Pokemon import:', error);
      throw error;
    }
  }

  /**
   * Import a single Pokemon set and its cards
   * @param {String} setId - Pokemon set ID
   * @returns {Promise<void>}
   */
  async importSingleSet(setId) {
    try {
      console.log(`\nImporting set: ${setId}`);

      // Fetch set information from Pokemon TCG API
      console.log(`  Fetching set information...`);
      const pokemonSets = await pokemon.set.where({ q: `id:${setId}` });
      
      if (!pokemonSets.data || pokemonSets.data.length === 0) {
        throw new Error(`Set ${setId} not found in Pokemon TCG API`);
      }

      const pokemonSet = pokemonSets.data[0];
      console.log(`  Found set: ${pokemonSet.name} (${pokemonSet.total} cards)`);

      // Check if set already exists in our database
      let existingSet = await SetModel.findOne({ 
        'metadata.sourceId': pokemonSet.id 
      });

      let dbSet;
      if (existingSet) {
        console.log(`  Set already exists in database, using existing set`);
        dbSet = existingSet;
      } else {
        // Map and save the set
        const mappedSet = DataMapper.mapSet(pokemonSet, this.pokemonCategory._id);
        dbSet = new SetModel(mappedSet);
        await dbSet.save();
        console.log(`  ✓ Set saved to database`);
        this.stats.setsImported++;
      }

      // Cache the set for card imports
      this.importedSets.set(setId, dbSet);

      // Import cards for this set
      await this.importCardsForSet(setId, dbSet);

    } catch (error) {
      console.error(`  Error importing set ${setId}:`, error.message);
      throw error;
    }
  }

  /**
   * Import all cards for a specific set
   * @param {String} setId - Pokemon set ID
   * @param {Object} dbSet - Database set object
   * @returns {Promise<void>}
   */
  async importCardsForSet(setId, dbSet) {
    try {
      console.log(`  Fetching cards for set ${setId}...`);

      // Fetch all cards for this set from Pokemon TCG API
      const pokemonCards = await pokemon.card.where({ 
        q: `set.id:${setId}`,
        pageSize: 250 // Maximum page size
      });

      if (!pokemonCards.data || pokemonCards.data.length === 0) {
        console.log(`  No cards found for set ${setId}`);
        return;
      }

      console.log(`  Found ${pokemonCards.data.length} cards, importing...`);

      let cardsImported = 0;
      let cardsSkipped = 0;

      for (const pokemonCard of pokemonCards.data) {
        try {
          // Check if card already exists
          const existingCard = await Card.findOne({ sourceId: pokemonCard.id });
          
          if (existingCard) {
            cardsSkipped++;
            continue;
          }

          // Map and save the card
          const mappedCard = DataMapper.mapCard(
            pokemonCard, 
            dbSet._id, 
            this.pokemonCategory._id
          );

          const dbCard = new Card(mappedCard);
          await dbCard.save();
          cardsImported++;

          // Progress indicator for large sets
          if (cardsImported % 25 === 0) {
            console.log(`    Imported ${cardsImported} cards...`);
          }

        } catch (error) {
          console.error(`    Error importing card ${pokemonCard.name}:`, error.message);
          this.stats.errors.push(`Card ${pokemonCard.name}: ${error.message}`);
        }
      }

      console.log(`  ✓ Imported ${cardsImported} cards, skipped ${cardsSkipped} existing cards`);
      this.stats.cardsImported += cardsImported;
      this.stats.cardsSkipped += cardsSkipped;

    } catch (error) {
      console.error(`  Error importing cards for set ${setId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all available Pokemon sets from the API
   * @returns {Promise<Array>} Array of available sets
   */
  async getAvailableSets() {
    try {
      console.log('Fetching all available Pokemon sets...');
      const sets = await pokemon.set.all();
      
      if (sets && Array.isArray(sets)) {
        console.log(`Found ${sets.length} available sets`);
        return sets.map(set => ({
          id: set.id,
          name: set.name,
          series: set.series,
          total: set.total,
          releaseDate: set.releaseDate
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching available sets:', error);
      throw error;
    }
  }

  /**
   * Print import summary statistics
   */
  printImportSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('POKEMON IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Sets imported: ${this.stats.setsImported}`);
    console.log(`Cards imported: ${this.stats.cardsImported}`);
    console.log(`Cards skipped (already exist): ${this.stats.cardsSkipped}`);
    console.log(`Errors: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.stats.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('='.repeat(50));
  }

  /**
   * Reset import statistics
   */
  resetStats() {
    this.stats = {
      setsImported: 0,
      cardsImported: 0,
      cardsSkipped: 0,
      errors: []
    };
  }
}

module.exports = PokemonImporter;
