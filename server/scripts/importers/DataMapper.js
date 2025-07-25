const mongoose = require('mongoose');

class DataMapper {
  /**
   * Maps a Pokemon TCG API set to our Set model schema
   * @param {Object} pokemonSet - Set object from Pokemon TCG API
   * @param {String} categoryId - MongoDB ObjectId of Pokemon category
   * @returns {Object} Mapped set object for our database
   */
  static mapSet(pokemonSet, categoryId) {
    return {
      name: pokemonSet.name,
      slug: this.createSlug(pokemonSet.name),
      setCode: pokemonSet.id.toUpperCase(),
      releaseDate: pokemonSet.releaseDate ? new Date(pokemonSet.releaseDate) : null,
      totalCards: pokemonSet.total || 0,
      description: `${pokemonSet.name} - ${pokemonSet.series || 'Pokemon TCG'} set`,
      isVintage: this.isVintageSet(pokemonSet.releaseDate),
      category: categoryId,
      metadata: {
        series: pokemonSet.series || 'Unknown',
        ptcgoCode: pokemonSet.ptcgoCode,
        language: 'english',
        sourceId: pokemonSet.id,
        sourceUrl: `https://api.pokemontcg.io/v2/sets/${pokemonSet.id}`
      }
    };
  }

  /**
   * Maps a Pokemon TCG API card to our Card model schema
   * @param {Object} pokemonCard - Card object from Pokemon TCG API
   * @param {String} setId - MongoDB ObjectId of the set
   * @param {String} categoryId - MongoDB ObjectId of Pokemon category
   * @returns {Object} Mapped card object for our database
   */
  static mapCard(pokemonCard, setId, categoryId) {
    return {
      name: pokemonCard.name,
      slug: this.createCardSlug(pokemonCard.name, pokemonCard.set.id, pokemonCard.number),
      cardNumber: pokemonCard.number,
      rarity: pokemonCard.rarity || 'Unknown',
      imageUrl: pokemonCard.images?.large || pokemonCard.images?.small || null,
      attributes: this.mapCardAttributes(pokemonCard),
      set: setId,
      category: categoryId,
      sourceId: pokemonCard.id,
      sourceUrl: `https://api.pokemontcg.io/v2/cards/${pokemonCard.id}`,
      lastUpdated: new Date(),
      marketData: this.mapMarketData(pokemonCard)
    };
  }

  /**
   * Maps Pokemon card attributes to our schema
   * @param {Object} pokemonCard - Card object from Pokemon TCG API
   * @returns {Object} Mapped attributes
   */
  static mapCardAttributes(pokemonCard) {
    const attributes = {};

    // Basic Pokemon info
    if (pokemonCard.types) {
      attributes.type = pokemonCard.types;
    }

    if (pokemonCard.hp) {
      attributes.hp = parseInt(pokemonCard.hp) || null;
    }

    if (pokemonCard.subtypes && pokemonCard.subtypes.length > 0) {
      attributes.stage = pokemonCard.subtypes[0];
    }

    // Attacks
    if (pokemonCard.attacks && pokemonCard.attacks.length > 0) {
      attributes.attacks = pokemonCard.attacks.map(attack => ({
        name: attack.name,
        cost: attack.cost || [],
        damage: attack.damage || '',
        description: attack.text || ''
      }));
    }

    // Weaknesses
    if (pokemonCard.weaknesses && pokemonCard.weaknesses.length > 0) {
      attributes.weakness = pokemonCard.weaknesses[0].type;
      attributes.weaknessValue = pokemonCard.weaknesses[0].value;
    }

    // Resistances
    if (pokemonCard.resistances && pokemonCard.resistances.length > 0) {
      attributes.resistance = pokemonCard.resistances[0].type;
      attributes.resistanceValue = pokemonCard.resistances[0].value;
    }

    // Retreat cost
    if (pokemonCard.retreatCost) {
      attributes.retreatCost = pokemonCard.retreatCost.length;
    }

    // Artist
    if (pokemonCard.artist) {
      attributes.artist = pokemonCard.artist;
    }

    // Supertype and subtypes
    if (pokemonCard.supertype) {
      attributes.supertype = pokemonCard.supertype;
    }

    if (pokemonCard.subtypes) {
      attributes.subtypes = pokemonCard.subtypes;
    }

    // Abilities
    if (pokemonCard.abilities && pokemonCard.abilities.length > 0) {
      attributes.abilities = pokemonCard.abilities.map(ability => ({
        name: ability.name,
        type: ability.type,
        description: ability.text
      }));
    }

    return attributes;
  }

  /**
   * Creates a URL-friendly slug from a name
   * @param {String} name - Name to convert to slug
   * @returns {String} URL-friendly slug
   */
  static createSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Creates a unique slug for a card
   * @param {String} name - Card name
   * @param {String} setId - Set ID
   * @param {String} number - Card number
   * @returns {String} Unique card slug
   */
  static createCardSlug(name, setId, number) {
    const nameSlug = this.createSlug(name);
    return `${nameSlug}-${setId}-${number}`;
  }

  /**
   * Maps market data from Pokemon TCG API to our schema
   * @param {Object} pokemonCard - Card object from Pokemon TCG API
   * @returns {Object} Mapped market data
   */
  static mapMarketData(pokemonCard) {
    const marketData = {
      lastUpdated: new Date(),
      averagePrice: {},
      priceRange: { low: 0, high: 0 },
      sources: {}
    };

    // Extract TCGPlayer prices
    if (pokemonCard.tcgplayer && pokemonCard.tcgplayer.prices) {
      const tcgPrices = pokemonCard.tcgplayer.prices;
      marketData.sources.tcgplayer = {
        url: pokemonCard.tcgplayer.url,
        updatedAt: pokemonCard.tcgplayer.updatedAt,
        prices: tcgPrices
      };

      // Use the most common price variant (holofoil, then normal, then reverseHolofoil)
      let primaryPrice = null;
      if (tcgPrices.holofoil && tcgPrices.holofoil.market) {
        primaryPrice = tcgPrices.holofoil.market;
      } else if (tcgPrices.normal && tcgPrices.normal.market) {
        primaryPrice = tcgPrices.normal.market;
      } else if (tcgPrices.reverseHolofoil && tcgPrices.reverseHolofoil.market) {
        primaryPrice = tcgPrices.reverseHolofoil.market;
      }

      if (primaryPrice) {
        marketData.averagePrice.raw = primaryPrice;
        marketData.priceRange.low = primaryPrice * 0.8; // Estimate low as 80% of market
        marketData.priceRange.high = primaryPrice * 1.5; // Estimate high as 150% of market
      }
    }

    // Extract Cardmarket prices (European market)
    if (pokemonCard.cardmarket && pokemonCard.cardmarket.prices) {
      const cmPrices = pokemonCard.cardmarket.prices;
      marketData.sources.cardmarket = {
        url: pokemonCard.cardmarket.url,
        updatedAt: pokemonCard.cardmarket.updatedAt,
        prices: cmPrices
      };

      // Use average sell price or trend price as backup
      if (cmPrices.averageSellPrice && !marketData.averagePrice.raw) {
        marketData.averagePrice.raw = cmPrices.averageSellPrice;
        marketData.priceRange.low = cmPrices.lowPrice || cmPrices.averageSellPrice * 0.8;
        marketData.priceRange.high = cmPrices.averageSellPrice * 1.5;
      }
    }

    // If no price data found, return empty structure
    if (!marketData.averagePrice.raw) {
      return {
        lastUpdated: new Date(),
        averagePrice: {},
        priceRange: { low: 0, high: 0 }
      };
    }

    return marketData;
  }

  /**
   * Determines if a set is vintage based on release date
   * @param {String} releaseDate - Release date string
   * @returns {Boolean} True if vintage (before 2010)
   */
  static isVintageSet(releaseDate) {
    if (!releaseDate) return false;
    const year = new Date(releaseDate).getFullYear();
    return year < 2010;
  }
}

module.exports = DataMapper;
