// Utility functions for CardTracker

// Navigation utilities
export function navigateToCard(cardId) {
    window.location.href = `/card.html?id=${cardId}`;
}

export function navigateToHome() {
    window.location.href = '/';
}

// Price formatting utilities
export function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0.00';
    }
    return price.toFixed(2);
}

export function formatPriceChange(change, percent) {
    const symbol = change >= 0 ? '+' : '';
    const className = change >= 0 ? 'price-up' : 'price-down';
    return {
        symbol,
        className,
        text: `${symbol}${percent}%`
    };
}

// API utilities
export async function fetchAPI(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// DOM utilities
export function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

export function addClickHandler(element, handler) {
    element.style.cursor = 'pointer';
    element.addEventListener('click', handler);
}

export function addHoverEffect(element) {
    element.addEventListener('mouseenter', () => {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = 'none';
    });
}

// Card data processing
export function processCardData(card) {
    const setName = card.set ? card.set.name : 'Unknown Set';
    
    let price = '0.00';
    if (card.marketData && card.marketData.averagePrice && card.marketData.averagePrice.raw) {
        price = formatPrice(card.marketData.averagePrice.raw);
    }
    
    // Generate mock price change for demo
    const isPositive = Math.random() > 0.3;
    const changePercent = (Math.random() * 15 + 1).toFixed(1);
    const priceChange = formatPriceChange(isPositive ? 1 : -1, changePercent);
    
    return {
        ...card,
        setName,
        formattedPrice: price,
        priceChange
    };
}

// Smooth scrolling for navigation
export function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Loading states
export function showLoading(container, message = 'Loading...') {
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 200px; color: #6b7280;">
            ${message}
        </div>
    `;
}

export function showError(container, message = 'Error loading data') {
    container.innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            ${message}
        </div>
    `;
}
