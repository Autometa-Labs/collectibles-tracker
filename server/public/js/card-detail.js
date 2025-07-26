// Card Detail Page JavaScript
class CardDetailPage {
    constructor() {
        this.cardId = this.getCardIdFromUrl();
        this.currentTab = 'market';
        this.init();
    }

    getCardIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async init() {
        if (!this.cardId) {
            this.showError('No card ID provided');
            return;
        }

        try {
            await this.loadCardData();
        } catch (error) {
            console.error('Error initializing card detail page:', error);
            this.showError('Failed to load card details');
        }
    }

    async loadCardData() {
        try {
            const response = await fetch(`/api/cards/${this.cardId}`);
            const data = await response.json();

            if (!data.success || !data.data) {
                throw new Error('Card not found');
            }

            this.card = data.data;
            this.pricingData = this.processPricingData(this.card.marketData);
            this.renderCardDetail();
            this.setupEventListeners();

        } catch (error) {
            console.error('Error loading card data:', error);
            this.showError('Card not found or failed to load');
        }
    }

    processPricingData(marketData) {
        if (!marketData) {
            return {
                primary: 0,
                range: { low: 0, high: 0 },
                sources: {},
                lastUpdated: null
            };
        }

        // Clean up pricing data to handle outliers and invalid values
        const cleanPrice = (price) => {
            if (!price || price === 999 || price === 9999 || price > 1000) {
                return null; // Filter out obvious placeholder/invalid prices
            }
            return price;
        };

        const cleanPriceRange = (range) => {
            if (!range) return { low: 0, high: 0 };
            
            const low = cleanPrice(range.low) || 0;
            const high = cleanPrice(range.high) || 0;
            
            // If high is unreasonably higher than low, cap it
            if (high > 0 && low > 0 && high > low * 50) {
                return { low, high: low * 10 }; // Cap at 10x the low price
            }
            
            return { low, high };
        };

        const primary = cleanPrice(marketData.averagePrice?.raw) || 0;
        const range = cleanPriceRange(marketData.priceRange);

        return {
            primary,
            range,
            sources: {
                tcgplayer: this.cleanSourceData(marketData.sources?.tcgplayer),
                cardmarket: this.cleanSourceData(marketData.sources?.cardmarket)
            },
            lastUpdated: marketData.lastUpdated
        };
    }

    cleanSourceData(sourceData) {
        if (!sourceData) return null;

        const cleanedData = { ...sourceData };
        
        // Handle CardMarket data structure (flat prices object)
        if (cleanedData.prices && typeof cleanedData.prices === 'object') {
            // Check if this is CardMarket format (flat object with price properties)
            const isCardMarketFormat = cleanedData.prices.hasOwnProperty('averageSellPrice') || 
                                     cleanedData.prices.hasOwnProperty('trendPrice') || 
                                     cleanedData.prices.hasOwnProperty('lowPrice');
            
            if (isCardMarketFormat) {
                // For CardMarket, just return the data as-is since it's already in the right format
                return cleanedData;
            } else {
                // Handle TCGPlayer format (nested variant objects)
                const cleanedPrices = {};
                
                Object.entries(cleanedData.prices).forEach(([variant, prices]) => {
                    if (prices && typeof prices === 'object') {
                        const cleanedVariantPrices = {};
                        
                        // Clean individual price values
                        Object.entries(prices).forEach(([priceType, value]) => {
                            if (typeof value === 'number' && value !== 999 && value !== 9999 && value <= 1000) {
                                cleanedVariantPrices[priceType] = value;
                            }
                        });
                        
                        // Only include variant if it has valid prices
                        if (Object.keys(cleanedVariantPrices).length > 0) {
                            // Calculate a reasonable market price if missing
                            if (!cleanedVariantPrices.market && cleanedVariantPrices.low && cleanedVariantPrices.high) {
                                const low = cleanedVariantPrices.low;
                                const high = cleanedVariantPrices.high;
                                
                                // Use median if range is reasonable, otherwise use low + 20%
                                if (high <= low * 10) {
                                    cleanedVariantPrices.market = (low + high) / 2;
                                } else {
                                    cleanedVariantPrices.market = low * 1.2;
                                }
                            }
                            
                            cleanedPrices[variant] = cleanedVariantPrices;
                        }
                    }
                });
                
                cleanedData.prices = cleanedPrices;
            }
        }
        
        return cleanedData;
    }

    renderCardDetail() {
        const container = document.getElementById('cardContent');
        
        // Update page title
        document.title = `${this.card.name} - CardTracker`;

        container.innerHTML = `
            <div class="card-detail-grid">
                <div class="card-image-section">
                    <div class="card-image-container">
                        ${this.card.imageUrl ? 
                            `<img src="${this.card.imageUrl}" alt="${this.card.name}">` : 
                            `<div class="card-placeholder">🃏</div>`
                        }
                    </div>
                </div>
                
                <div class="card-info-section">
                    <h1>${this.card.name}</h1>
                    <div class="card-meta">
                        ${this.card.set ? this.card.set.name : 'Unknown Set'} • 
                        ${this.card.rarity} • 
                        #${this.card.cardNumber || 'N/A'}
                    </div>
                    
                    <div class="price-highlight">
                        <div class="price-main">$${this.pricingData.primary.toFixed(2)}</div>
                        <div class="price-subtitle">
                            Market Average • Range: $${this.pricingData.range.low.toFixed(2)} - $${this.pricingData.range.high.toFixed(2)}
                        </div>
                    </div>
                    
                    <button class="add-to-portfolio" disabled>
                        Add to Portfolio (Coming Soon)
                    </button>
                </div>
            </div>
            
            <div class="tabs-container">
                <div class="tabs-nav">
                    <button class="tab-button active" data-tab="market">Market Price</button>
                    <button class="tab-button" data-tab="sources">Price Sources</button>
                    <button class="tab-button" data-tab="history">Price History</button>
                </div>
                
                <div class="tab-content" id="tabContent">
                    ${this.renderMarketTab()}
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        const tabContent = document.getElementById('tabContent');
        this.currentTab = tabName;

        switch (tabName) {
            case 'market':
                tabContent.innerHTML = this.renderMarketTab();
                break;
            case 'sources':
                tabContent.innerHTML = this.renderSourcesTab();
                break;
            case 'history':
                tabContent.innerHTML = this.renderHistoryTab();
                break;
        }
    }

    renderMarketTab() {
        return `
            <div class="market-overview">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; font-size: 1.25rem;">Market Overview</h3>
                
                <div class="market-stats">
                    <div class="stat-card">
                        <div class="stat-label">Average Price</div>
                        <div class="stat-value positive">$${this.pricingData.primary.toFixed(2)}</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">Low Price</div>
                        <div class="stat-value negative">$${this.pricingData.range.low.toFixed(2)}</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-label">High Price</div>
                        <div class="stat-value positive">$${this.pricingData.range.high.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="portfolio-impact">
                    <h4 style="margin-bottom: 1rem; color: #1f2937;">Portfolio Impact</h4>
                    <p style="color: #6b7280; line-height: 1.6; margin: 0;">
                        This price represents the unified market value used for portfolio calculations. 
                        It's calculated from multiple trusted sources to give you the most accurate 
                        representation of your card's current worth.
                    </p>
                </div>
            </div>
        `;
    }

    renderSourcesTab() {
        const tcgplayer = this.pricingData.sources.tcgplayer;
        const cardmarket = this.pricingData.sources.cardmarket;

        let content = '<div style="display: flex; flex-direction: column; gap: 2rem;">';

        // Only show TCGPlayer section if data exists
        if (tcgplayer && tcgplayer.prices && Object.keys(tcgplayer.prices).length > 0) {
            content += `
                <div class="source-card">
                    <div class="source-header tcgplayer">
                        <div class="source-icon">🇺🇸</div>
                        <div class="source-info">
                            <h3>TCGPlayer</h3>
                            <p>United States Market</p>
                        </div>
                    </div>
                    
                    <div class="source-prices">
                        ${Object.entries(tcgplayer.prices || {}).map(([variant, prices]) => `
                            <div class="price-variant">
                                <div class="variant-label">${variant.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div class="variant-price">$${prices.market || prices.mid || 'N/A'}</div>
                                ${prices.low && prices.high ? `
                                    <div class="variant-range">Range: $${prices.low} - $${prices.high}</div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="source-updated">
                        Updated: ${tcgplayer.updatedAt || 'Unknown'}
                    </div>
                </div>
            `;
        }

        // Only show CardMarket section if data exists
        if (cardmarket && cardmarket.prices) {
            const prices = cardmarket.prices;
            const hasValidPrices = prices.averageSellPrice || prices.trendPrice || prices.lowPrice;
            
            if (hasValidPrices) {
                content += `
                    <div class="source-card">
                        <div class="source-header cardmarket">
                            <div class="source-icon">🇪🇺</div>
                            <div class="source-info">
                                <h3>CardMarket</h3>
                                <p>European Market</p>
                            </div>
                        </div>
                        
                        <div class="source-prices">
                            ${prices.averageSellPrice ? `
                                <div class="price-variant">
                                    <div class="variant-label">Average Sell</div>
                                    <div class="variant-price">$${prices.averageSellPrice.toFixed(2)}</div>
                                </div>
                            ` : ''}
                            
                            ${prices.trendPrice ? `
                                <div class="price-variant">
                                    <div class="variant-label">Trend Price</div>
                                    <div class="variant-price">$${prices.trendPrice.toFixed(2)}</div>
                                </div>
                            ` : ''}
                            
                            ${prices.lowPrice ? `
                                <div class="price-variant">
                                    <div class="variant-label">Low Price</div>
                                    <div class="variant-price">$${prices.lowPrice.toFixed(2)}</div>
                                </div>
                            ` : ''}
                            
                            ${prices.avg7 ? `
                                <div class="price-variant">
                                    <div class="variant-label">7-Day Average</div>
                                    <div class="variant-price">$${prices.avg7.toFixed(2)}</div>
                                </div>
                            ` : ''}
                            
                            ${prices.avg30 ? `
                                <div class="price-variant">
                                    <div class="variant-label">30-Day Average</div>
                                    <div class="variant-price">$${prices.avg30.toFixed(2)}</div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="source-updated">
                            Updated: ${cardmarket.updatedAt || 'Recently'}
                        </div>
                    </div>
                `;
            }
        }

        // Only show "no data" message if neither source has valid data
        const hasTcgData = tcgplayer && tcgplayer.prices && Object.keys(tcgplayer.prices).length > 0;
        const hasCardMarketData = cardmarket && cardmarket.prices && (cardmarket.prices.averageSellPrice || cardmarket.prices.trendPrice || cardmarket.prices.lowPrice);
        
        if (!hasTcgData && !hasCardMarketData) {
            content += `
                <div class="no-data">
                    <div class="no-data-icon">📊</div>
                    <h3>No Pricing Sources Available</h3>
                    <p>Pricing data is not available for this card at the moment.</p>
                </div>
            `;
        }

        content += '</div>';
        return content;
    }

    renderHistoryTab() {
        return `
            <div class="no-data">
                <div class="no-data-icon">📈</div>
                <h3>Price History Coming Soon</h3>
                <p>
                    Historical price tracking and trend analysis will be available in a future update. 
                    This will include interactive charts showing price movements over time.
                </p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('cardContent');
        container.innerHTML = `
            <div class="error">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="/" style="color: #3b82f6; text-decoration: none;">← Return to Home</a>
            </div>
        `;
    }
}

// Initialize the card detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CardDetailPage();
});
