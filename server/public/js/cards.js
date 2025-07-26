// Cards module for CardTracker
import { fetchAPI, processCardData, createElement, addClickHandler, addHoverEffect, navigateToCard, showLoading, showError } from './utils.js';

export class CardsManager {
    constructor() {
        this.featuredCardsContainer = document.getElementById('featuredCards');
        this.trendingCardsContainer = document.getElementById('trendingCards');
    }

    async loadFeaturedCards() {
        if (!this.featuredCardsContainer) return;

        try {
            showLoading(this.featuredCardsContainer, 'Loading featured cards...');
            
            const data = await fetchAPI('/api/cards?limit=6');
            
            if (data.data.length > 0) {
                this.renderFeaturedCards(data.data);
            } else {
                showError(this.featuredCardsContainer, 'No featured cards available');
            }
        } catch (error) {
            console.error('Error loading featured cards:', error);
            showError(this.featuredCardsContainer, 'Failed to load featured cards');
        }
    }

    renderFeaturedCards(cards) {
        this.featuredCardsContainer.innerHTML = '';
        
        cards.forEach(card => {
            const processedCard = processCardData(card);
            const cardElement = this.createCardElement(processedCard);
            this.featuredCardsContainer.appendChild(cardElement);
        });
    }

    async loadTrendingCards() {
        if (!this.trendingCardsContainer) return;

        try {
            showLoading(this.trendingCardsContainer, 'Loading trending cards...');
            
            const data = await fetchAPI('/api/cards?limit=4');
            
            if (data.data.length > 0) {
                this.renderTrendingCards(data.data);
            } else {
                showError(this.trendingCardsContainer, 'No trending cards available');
            }
        } catch (error) {
            console.error('Error loading trending cards:', error);
            showError(this.trendingCardsContainer, 'Failed to load trending cards');
        }
    }

    renderTrendingCards(cards) {
        this.trendingCardsContainer.innerHTML = '';
        
        cards.forEach(card => {
            const processedCard = processCardData(card);
            const trendingItem = this.createTrendingItem(processedCard);
            this.trendingCardsContainer.appendChild(trendingItem);
        });
    }

    createCardElement(card) {
        const cardElement = createElement('div', 'card');
        
        cardElement.innerHTML = `
            <div class="card-image">
                ${card.imageUrl ? 
                    `<img src="${card.imageUrl}" alt="${card.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : 
                    'Card Image'
                }
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-set">${card.setName} • ${card.rarity}</div>
            <div class="card-price">$${card.formattedPrice} <span class="price-change ${card.priceChange.className}">${card.priceChange.text}</span></div>
        `;
        
        // Add click handler and hover effects
        addClickHandler(cardElement, () => navigateToCard(card._id));
        addHoverEffect(cardElement);
        
        return cardElement;
    }

    createTrendingItem(card) {
        const trendingItem = createElement('div', 'trending-item');
        
        trendingItem.innerHTML = `
            <div class="trending-info">
                <h4>${card.name}</h4>
                <p>${card.setName} • ${card.rarity}</p>
            </div>
            <div class="trending-price">
                <div class="card-price">$${card.formattedPrice}</div>
                <span class="price-change ${card.priceChange.className}">${card.priceChange.text}</span>
            </div>
        `;
        
        // Add click handler
        addClickHandler(trendingItem, () => navigateToCard(card._id));
        
        return trendingItem;
    }

    // Initialize all card loading
    async loadAllCards() {
        await Promise.all([
            this.loadFeaturedCards(),
            this.loadTrendingCards()
        ]);
    }
}
