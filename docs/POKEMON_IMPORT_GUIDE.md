# Pokemon Card Import Guide

This guide explains how to use the `importPokemon.js` script to import Pokemon Trading Card Game data with complete pricing information into your collectibles tracker database.

## Overview

The Pokemon importer fetches card data directly from the Pokemon TCG API and automatically includes:
- ✅ Complete card information (name, rarity, type, HP, attacks, etc.)
- ✅ High-resolution card images
- ✅ **Real-time market pricing data** from multiple sources (TCGPlayer, CardMarket)
- ✅ Price ranges, averages, and historical data
- ✅ Automatic data mapping and database storage

## Prerequisites

1. **Pokemon TCG API Key** (recommended for higher rate limits)
   - Set `POKEMON_TCG_API_KEY` in your environment variables
   - Get your free API key at: https://pokemontcg.io/

2. **Running Application**
   - MongoDB database running
   - Application deployed (Docker/Kubernetes)

## Basic Usage

### Command Structure
```bash
kubectl exec -it [pod-name] -- node server/scripts/importPokemon.js [OPTIONS]
```

### Quick Start Examples

```bash
# Import popular vintage sets
kubectl exec -it [pod-name] -- node server/scripts/importPokemon.js --sets base1,base2,gym1,gym2

# Import just Base Set
kubectl exec -it [pod-name] -- node server/scripts/importPokemon.js --sets base1

# Import multiple sets
kubectl exec -it [pod-name] -- node server/scripts/importPokemon.js --sets base1 base2 gym1
```

## Available Commands

### Import Specific Sets
```bash
# Single set
--sets base1

# Multiple sets (comma-separated)
--sets base1,base2,gym1,gym2

# Multiple sets (space-separated)
--sets base1 base2 gym1
```

### Information Commands
```bash
# List all available sets from Pokemon TCG API
--list

# Show currently imported sets in your database
--imported

# Show help information
--help
```

### Maintenance Commands
```bash
# Clean up problematic/duplicate sets
--cleanup

# Import ALL available sets (use with caution!)
--all
```

## Popular Pokemon Set IDs

| Set ID | Name | Cards | Era |
|--------|------|-------|-----|
| `base1` | Base Set | 102 | Classic |
| `base2` | Jungle | 64 | Classic |
| `gym1` | Gym Heroes | 132 | Classic |
| `gym2` | Gym Challenge | 132 | Classic |
| `neo1` | Neo Genesis | 111 | Neo |
| `neo2` | Neo Discovery | 75 | Neo |
| `neo3` | Neo Destiny | 105 | Neo |

## Real-World Examples

### Example 1: Import Classic Sets
```bash
kubectl exec -it collectibles-tracker-pod -- node server/scripts/importPokemon.js --sets base1,base2,gym1,gym2
```

**Output:**
```
✓ Pokemon TCG API key configured
✓ Connected to MongoDB
Pokemon Card Importer
==================================================
Target sets: base1, base2, gym1, gym2
Set names: Base Set, Jungle, Gym Heroes, Gym Challenge

Starting import of 4 Pokemon sets...
✓ Pokemon category already exists

Importing set: base1
  Found set: Base (102 cards)
  ✓ Set saved to database
  ✓ Imported 102 cards, skipped 0 existing cards

[... continues for each set ...]

==================================================
POKEMON IMPORT SUMMARY
==================================================
Sets imported: 4
Cards imported: 430
Cards skipped (already exist): 0
Errors: 0
==================================================
```

### Example 2: Check What's Already Imported
```bash
kubectl exec -it collectibles-tracker-pod -- node server/scripts/importPokemon.js --imported
```

**Output:**
```
Currently Imported Pokemon Sets:
================================================================================
Set Code    Name                          Series              Cards   Imported
--------------------------------------------------------------------------------
BASE1       Base                          Base                102/102 2025-07-25
BASE2       Jungle                        Jungle              64/64   2025-07-25
GYM1        Gym Heroes                    Gym                 132/132 2025-07-25
GYM2        Gym Challenge                 Gym                 132/132 2025-07-25
--------------------------------------------------------------------------------
Total: 4 sets imported

📊 Summary:
   • 430 cards imported
   • 430 cards expected
   • 100.0% completion rate
```

## Pricing Data Included

Each imported card automatically includes comprehensive market data:

```json
{
  "marketData": {
    "lastUpdated": "2025-07-25T23:59:16.824Z",
    "averagePrice": {
      "raw": 51.77
    },
    "priceRange": {
      "low": 41.42,
      "high": 77.66
    },
    "sources": {
      "tcgplayer": {
        "url": "https://prices.pokemontcg.io/tcgplayer/base1-1",
        "updatedAt": "2025/07/25",
        "prices": {
          "holofoil": {
            "low": 33,
            "mid": 49.3,
            "high": 149.99,
            "market": 51.77,
            "directLow": 38.46
          }
        }
      },
      "cardmarket": {
        "url": "https://prices.pokemontcg.io/cardmarket/base1-1",
        "updatedAt": "2025/07/25",
        "prices": {
          "averageSellPrice": 129.97,
          "lowPrice": 32.5,
          "trendPrice": 164.79,
          "avg1": 129.95,
          "avg7": 161.11,
          "avg30": 170.86
        }
      }
    }
  }
}
```

## Using Your API After Import

Once cards are imported, you can query them through your API:

### Get All Sets
```bash
curl "http://localhost:30081/api/sets"
```

### Get Pokemon Sets
```bash
curl "http://localhost:30081/api/sets/category/pokemon"
```

### Get Cards with Pagination
```bash
curl "http://localhost:30081/api/cards?limit=10&page=1"
```

### Get Cards from Specific Set
```bash
curl "http://localhost:30081/api/cards?set=base"
```

## Troubleshooting

### Common Issues

**1. Set Not Found Error**
```
Error importing set jungle: Set jungle not found in Pokemon TCG API
```
**Solution:** Use `--list` to see available set IDs, as some names may differ.

**2. Rate Limiting**
```
Request failed with status code 429
```
**Solution:** Add `POKEMON_TCG_API_KEY` to your environment variables for higher rate limits.

**3. Memory Issues**
```
command terminated with exit code 137
```
**Solution:** Import sets in smaller batches instead of using `--all`.

### Best Practices

1. **Start Small:** Import a few sets first to test functionality
2. **Use API Key:** Set `POKEMON_TCG_API_KEY` for better performance
3. **Check Existing:** Use `--imported` before importing to avoid duplicates
4. **Batch Imports:** Import sets in groups rather than all at once

## Environment Variables

```bash
# Required for database connection
MONGODB_URI=mongodb://localhost:27017/collectibles-tracker

# Recommended for better API performance
POKEMON_TCG_API_KEY=your-api-key-here
```

## Performance Notes

- **With API Key:** ~200 cards/minute
- **Without API Key:** ~50 cards/minute (rate limited)
- **Memory Usage:** ~100MB per 1000 cards
- **Storage:** ~1KB per card in database

## Integration with Frontend

After importing, your cards are immediately available through your REST API with complete pricing data. Perfect for:

- Card collection tracking
- Price monitoring dashboards
- Market analysis tools
- Trading applications

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Use `--help` for command reference
3. Use `--imported` to verify current database state
4. Check Pokemon TCG API status at https://pokemontcg.io/
