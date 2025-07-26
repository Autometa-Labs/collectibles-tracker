// Sets module for CardTracker
import { fetchAPI, createElement, addClickHandler, navigateToCard, showLoading, showError } from './utils.js';

export class SetsManager {
    constructor() {
        this.setsContainer = document.getElementById('pokemonSets');
        this.currentPage = 1;
        this.setsPerPage = 6;
    }

    async loadPokemonSets(page = 1) {
        if (!this.setsContainer) return;

        try {
            showLoading(this.setsContainer, 'Loading Pokemon sets...');
            
            const [setsData, cardsData] = await Promise.all([
                fetchAPI(`/api/sets?category=pokemon&limit=${this.setsPerPage}&page=${page}`),
                fetchAPI('/api/cards')
            ]);
            
            if (setsData.data.length > 0) {
                const setImageMap = this.createSetImageMap(cardsData.data);
                this.renderSets(setsData.data, setImageMap);
                
                if (setsData.pagination && setsData.pagination.pages > 1) {
                    this.addPagination(setsData.pagination);
                }
            } else {
                showError(this.setsContainer, 'No Pokemon sets available');
            }
        } catch (error) {
            console.error('Error loading Pokemon sets:', error);
            showError(this.setsContainer, 'Failed to load Pokemon sets');
        }
    }

    createSetImageMap(cards) {
        const setImageMap = {};
        cards.forEach(card => {
            if (card.imageUrl && card.set && card.set._id && !setImageMap[card.set._id]) {
                setImageMap[card.set._id] = card.imageUrl;
            }
        });
        return setImageMap;
    }

    renderSets(sets, setImageMap) {
        this.setsContainer.innerHTML = '';
        
        sets.forEach(set => {
            const setElement = this.createSetElement(set, setImageMap[set._id]);
            this.setsContainer.appendChild(setElement);
        });
    }

    createSetElement(set, setImage) {
        const setElement = createElement('div', 'card');
        
        setElement.innerHTML = `
            <div class="card-image">
                ${setImage ? 
                    `<img src="${setImage}" alt="${set.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : 
                    '📦'
                }
            </div>
            <div class="card-name">${set.name}</div>
            <div class="card-set">${set.metadata?.series || 'Pokemon'} • ${set.releaseDate ? new Date(set.releaseDate).getFullYear() : 'Classic'}</div>
            <div class="card-price">${set.totalCards} cards</div>
        `;
        
        // Add click handler to view set details
        addClickHandler(setElement, () => this.viewSetDetails(set.slug, set.name));
        
        return setElement;
    }

    addPagination(pagination) {
        // Remove existing pagination
        const existingPagination = this.setsContainer.parentElement.querySelector('.pagination-controls');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        const paginationDiv = createElement('div', 'pagination-controls');
        paginationDiv.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 2rem;
            padding: 1rem;
        `;
        
        // Previous button
        const prevBtn = this.createPaginationButton('← Previous', pagination.page === 1, () => {
            this.currentPage = pagination.page - 1;
            this.loadPokemonSets(this.currentPage);
        });
        
        // Page info
        const pageInfo = createElement('span', '', `Page ${pagination.page} of ${pagination.pages}`);
        pageInfo.style.cssText = `
            color: #6b7280;
            font-weight: 500;
            min-width: 120px;
            text-align: center;
        `;
        
        // Next button
        const nextBtn = this.createPaginationButton('Next →', pagination.page === pagination.pages, () => {
            this.currentPage = pagination.page + 1;
            this.loadPokemonSets(this.currentPage);
        });
        
        paginationDiv.appendChild(prevBtn);
        paginationDiv.appendChild(pageInfo);
        paginationDiv.appendChild(nextBtn);
        
        this.setsContainer.parentElement.appendChild(paginationDiv);
    }

    createPaginationButton(text, disabled, onClick) {
        const button = createElement('button', '', text);
        button.disabled = disabled;
        button.style.cssText = `
            padding: 0.5rem 1rem;
            border: 1px solid #e5e7eb;
            background: ${disabled ? '#f9fafb' : 'white'};
            color: ${disabled ? '#9ca3af' : '#374151'};
            border-radius: 6px;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            font-weight: 500;
        `;
        
        if (!disabled) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    async viewSetDetails(setSlug, setName, page = 1) {
        try {
            const cardsPerPage = 24;
            const data = await fetchAPI(`/api/cards/set/${setSlug}?page=${page}&limit=${cardsPerPage}`);
            
            if (data.data.length === 0 && page === 1) {
                alert(`No cards found for ${setName}\n\nThis set appears to be empty in our database. It may be a placeholder or the cards haven't been imported yet.`);
                return;
            }
            
            this.createSetModal(setName, data);
        } catch (error) {
            console.error('Error loading set details:', error);
            alert('Error loading set details. Please try again.');
        }
    }

    createSetModal(setName, data) {
        const modalId = 'setDetailsModal';
        
        // Remove existing modal if it exists
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalDiv = createElement('div');
        modalDiv.id = modalId;
        modalDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modalContent = createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            width: 95%;
            max-width: 1200px;
            max-height: 90%;
            overflow-y: auto;
            position: relative;
        `;
        
        // Close button
        const closeBtn = createElement('button', '', '×');
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 2rem;
            height: 2rem;
            cursor: pointer;
            font-size: 1.2rem;
            font-weight: bold;
        `;
        closeBtn.addEventListener('click', () => modalDiv.remove());
        
        // Header
        const header = createElement('div');
        header.innerHTML = `
            <h2 style="margin-bottom: 0.5rem; color: #1f2937;">${setName}</h2>
            <p style="margin-bottom: 2rem; color: #6b7280;">
                ${data.pagination ? `${data.pagination.total} total cards` : `${data.data.length} cards`}
                ${data.pagination && data.pagination.pages > 1 ? ` • Page ${data.pagination.page} of ${data.pagination.pages}` : ''}
            </p>
        `;
        
        // Cards grid
        const cardsGrid = this.createCardsGrid(data.data);
        
        // Pagination for modal
        const paginationDiv = createElement('div');
        if (data.pagination && data.pagination.pages > 1) {
            this.createModalPagination(paginationDiv, data.pagination, setName);
        }
        
        // Assemble modal
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(header);
        modalContent.appendChild(cardsGrid);
        if (paginationDiv.children.length > 0) {
            modalContent.appendChild(paginationDiv);
        }
        
        modalDiv.appendChild(modalContent);
        
        // Close modal when clicking outside
        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) {
                modalDiv.remove();
            }
        });
        
        // Add modal to page
        document.body.appendChild(modalDiv);
    }

    createCardsGrid(cards) {
        const cardsGrid = createElement('div');
        cardsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        `;
        
        cards.forEach(card => {
            const cardElement = this.createModalCardElement(card);
            cardsGrid.appendChild(cardElement);
        });
        
        return cardsGrid;
    }

    createModalCardElement(card) {
        // Get price - handle missing marketData
        let price = '25';
        if (card.marketData && card.marketData.averagePrice && card.marketData.averagePrice.raw) {
            price = card.marketData.averagePrice.raw.toFixed(2);
        }
        
        const cardElement = createElement('div');
        cardElement.style.cssText = `
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            transition: transform 0.2s, box-shadow 0.2s;
        `;
        
        cardElement.innerHTML = `
            <div style="width: 100%; height: 140px; background: #f3f4f6; border-radius: 4px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center;">
                ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : '🃏'}
            </div>
            <h4 style="font-size: 0.875rem; margin: 0.5rem 0; color: #1f2937;">${card.name}</h4>
            <p style="font-size: 0.75rem; color: #6b7280; margin: 0;">${card.rarity}</p>
            <p style="font-size: 0.75rem; color: #059669; margin: 0.25rem 0;">$${price}</p>
        `;
        
        // Add hover effect and click handler
        cardElement.addEventListener('mouseenter', () => {
            cardElement.style.transform = 'translateY(-2px)';
            cardElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        
        cardElement.addEventListener('mouseleave', () => {
            cardElement.style.transform = 'translateY(0)';
            cardElement.style.boxShadow = 'none';
        });
        
        addClickHandler(cardElement, () => navigateToCard(card._id));
        
        return cardElement;
    }

    createModalPagination(container, pagination, setName) {
        container.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            padding: 1rem 0;
            border-top: 1px solid #e5e7eb;
        `;
        
        // Previous button
        const prevBtn = this.createPaginationButton('← Previous', pagination.page === 1, () => {
            this.viewSetDetails(setName.toLowerCase().replace(/\s+/g, '-'), setName, pagination.page - 1);
        });
        
        // Page info
        const pageInfo = createElement('span', '', `Page ${pagination.page} of ${pagination.pages}`);
        pageInfo.style.cssText = `
            color: #6b7280;
            font-weight: 500;
            min-width: 120px;
            text-align: center;
        `;
        
        // Next button
        const nextBtn = this.createPaginationButton('Next →', pagination.page === pagination.pages, () => {
            this.viewSetDetails(setName.toLowerCase().replace(/\s+/g, '-'), setName, pagination.page + 1);
        });
        
        container.appendChild(prevBtn);
        container.appendChild(pageInfo);
        container.appendChild(nextBtn);
    }
}
