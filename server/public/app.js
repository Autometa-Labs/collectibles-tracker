// State management
let isLoggedIn = false;
let currentUser = null;

// DOM elements
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const closeModal = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const landingHero = document.getElementById('landingHero');
const userDashboard = document.getElementById('userDashboard');

// Modal functionality
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulate login (in real app, this would call API)
        currentUser = {
            name: 'Alex',
            email: 'alex@example.com',
            cardsOwned: 247,
            portfolioValue: 3450,
            completedSets: 12,
            baseSetProgress: 85
        };
        
        isLoggedIn = true;
        loginModal.style.display = 'none';
        showDashboard();
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        isLoggedIn = false;
        currentUser = null;
        showLanding();
    });
}

// Show dashboard
function showDashboard() {
    if (landingHero) landingHero.style.display = 'none';
    if (userDashboard) userDashboard.style.display = 'block';
    if (currentUser) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = currentUser.name;
    }
    
    // Initialize chart
    initializeChart();
}

// Show landing page
function showLanding() {
    if (landingHero) landingHero.style.display = 'block';
    if (userDashboard) userDashboard.style.display = 'none';
}

// Initialize portfolio chart
function initializeChart() {
    const canvas = document.getElementById('portfolioChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample data for portfolio performance
    const data = [2800, 2950, 3100, 2980, 3200, 3350, 3450];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Find min and max values
    const minValue = Math.min(...data) - 200;
    const maxValue = Math.max(...data) + 200;
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
        const x = padding + (chartWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
    }
    
    // Draw line chart
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#3b82f6';
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
        const x = padding + (chartWidth / (labels.length - 1)) * index;
        ctx.fillText(label, x, canvas.height - 20);
    });
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = minValue + ((maxValue - minValue) / 5) * (5 - i);
        const y = padding + (chartHeight / 5) * i + 4;
        ctx.fillText('$' + Math.round(value), padding - 10, y);
    }
}

// Add Cards functionality
const addCardBtn = document.getElementById('addCardBtn');
if (addCardBtn) {
    addCardBtn.addEventListener('click', () => {
        alert('Add Cards feature would open a modal to search and add cards to your collection.\n\nIn a full implementation, this would connect to the card database API.');
    });
}

// Search functionality (if search elements exist)
const searchBtn = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search-input');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value;
        if (query.trim()) {
            alert(`Searching for: "${query}"\n\nIn a full implementation, this would search our card database and display results.`);
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Smooth scrolling for navigation
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

// Fetch and display real data from API
async function loadFeaturedCards() {
    try {
        const response = await fetch('/api/cards?limit=6');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const featuredCardsContainer = document.getElementById('featuredCards');
            if (!featuredCardsContainer) return;
            
            featuredCardsContainer.innerHTML = '';
            
            data.data.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                
                // Get set info (already populated in API response)
                const setName = card.set ? card.set.name : 'Unknown Set';
                
                // Get price - handle missing marketData
                let price = '25';
                if (card.marketData && card.marketData.averagePrice && card.marketData.averagePrice.raw) {
                    price = card.marketData.averagePrice.raw;
                }
                
                // Calculate price change (mock data for demo)
                const priceChange = Math.random() > 0.5 ? '+' : '-';
                const changePercent = (Math.random() * 10 + 1).toFixed(1);
                const changeClass = priceChange === '+' ? 'price-up' : 'price-down';
                
                cardElement.innerHTML = `
                    <div class="card-image">
                        ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : 'Card Image'}
                    </div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-set">${setName} • ${card.rarity}</div>
                    <div class="card-price">$${price} <span class="price-change ${changeClass}">${priceChange}${changePercent}%</span></div>
                `;
                
                featuredCardsContainer.appendChild(cardElement);
            });
        }
    } catch (error) {
        console.error('Error loading featured cards:', error);
        const featuredCardsContainer = document.getElementById('featuredCards');
        if (featuredCardsContainer) {
            featuredCardsContainer.innerHTML = `
                <div class="card">
                    <div class="card-image">Error</div>
                    <div class="card-name">Failed to load cards</div>
                    <div class="card-set">Please check API connection</div>
                    <div class="card-price">$0.00</div>
                </div>
            `;
        }
    }
}

async function loadTrendingCards() {
    try {
        const response = await fetch('/api/cards?limit=4');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const trendingContainer = document.getElementById('trendingCards');
            if (!trendingContainer) return;
            
            trendingContainer.innerHTML = '';
            
            data.data.forEach(card => {
                const trendingItem = document.createElement('div');
                trendingItem.className = 'trending-item';
                
                // Get set info (already populated in API response)
                const setName = card.set ? card.set.name : 'Unknown Set';
                
                // Get price - handle missing marketData
                let price = '25';
                if (card.marketData && card.marketData.averagePrice && card.marketData.averagePrice.raw) {
                    price = card.marketData.averagePrice.raw;
                }
                
                // Generate mock trending data
                const isPositive = Math.random() > 0.3; // 70% chance of positive trend
                const changePercent = (Math.random() * 15 + 1).toFixed(1);
                const changeClass = isPositive ? 'price-up' : 'price-down';
                const changeSymbol = isPositive ? '+' : '-';
                
                trendingItem.innerHTML = `
                    <div class="trending-info">
                        <h4>${card.name}</h4>
                        <p>${setName} • ${card.rarity}</p>
                    </div>
                    <div class="trending-price">
                        <div class="card-price">$${price}</div>
                        <span class="price-change ${changeClass}">${changeSymbol}${changePercent}%</span>
                    </div>
                `;
                
                trendingContainer.appendChild(trendingItem);
            });
        }
    } catch (error) {
        console.error('Error loading trending cards:', error);
        const trendingContainer = document.getElementById('trendingCards');
        if (trendingContainer) {
            trendingContainer.innerHTML = `
                <div class="trending-item">
                    <div class="trending-info">
                        <h4>Error loading data</h4>
                        <p>Please check API connection</p>
                    </div>
                    <div class="trending-price">
                        <div class="card-price">$0.00</div>
                        <span class="price-change">Error</span>
                    </div>
                </div>
            `;
        }
    }
}

// Global pagination state
let currentSetsPage = 1;
const setsPerPage = 6;

// Load Pokemon sets from API with pagination
async function loadPokemonSets(page = 1) {
    try {
        const [setsResponse, cardsResponse] = await Promise.all([
            fetch(`/api/sets?category=pokemon&limit=${setsPerPage}&page=${page}`),
            fetch('/api/cards')
        ]);
        
        const setsData = await setsResponse.json();
        const cardsData = await cardsResponse.json();
        
        if (setsData.success && setsData.data.length > 0) {
            const setsContainer = document.getElementById('pokemonSets');
            if (!setsContainer) return;
            
            // Create a map of set ID to random card image
            const setImageMap = {};
            if (cardsData.success) {
                cardsData.data.forEach(card => {
                    if (card.imageUrl && card.set && card.set._id && !setImageMap[card.set._id]) {
                        setImageMap[card.set._id] = card.imageUrl;
                    }
                });
            }
            
            setsContainer.innerHTML = '';
            
            setsData.data.forEach(set => {
                const setElement = document.createElement('div');
                setElement.className = 'card';
                setElement.style.cursor = 'pointer';
                
                // Get a random card image from this set
                const setImage = setImageMap[set._id];
                
                setElement.innerHTML = `
                    <div class="card-image">
                        ${setImage ? `<img src="${setImage}" alt="${set.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : '📦'}
                    </div>
                    <div class="card-name">${set.name}</div>
                    <div class="card-set">${set.metadata?.series || 'Pokemon'} • ${set.releaseDate ? new Date(set.releaseDate).getFullYear() : 'Classic'}</div>
                    <div class="card-price">${set.totalCards} cards</div>
                `;
                
                // Add click handler to view set details
                setElement.addEventListener('click', () => {
                    viewSetDetails(set.slug, set.name);
                });
                
                setsContainer.appendChild(setElement);
            });
            
            // Add pagination controls if there are more than 6 sets
            if (setsData.pagination && setsData.pagination.pages > 1) {
                addSetsPagination(setsData.pagination, setsContainer.parentElement);
            }
        }
    } catch (error) {
        console.error('Error loading Pokemon sets:', error);
        const setsContainer = document.getElementById('pokemonSets');
        if (setsContainer) {
            setsContainer.innerHTML = `
                <div class="card">
                    <div class="card-image">Error</div>
                    <div class="card-name">Failed to load sets</div>
                    <div class="card-set">Please check API connection</div>
                    <div class="card-price">0 cards</div>
                </div>
            `;
        }
    }
}

// Add pagination controls for sets
function addSetsPagination(pagination, container) {
    // Remove existing pagination
    const existingPagination = container.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    paginationDiv.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
        padding: 1rem;
    `;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = pagination.page === 1;
    prevBtn.style.cssText = `
        padding: 0.5rem 1rem;
        border: 1px solid #e5e7eb;
        background: ${pagination.page === 1 ? '#f9fafb' : 'white'};
        color: ${pagination.page === 1 ? '#9ca3af' : '#374151'};
        border-radius: 6px;
        cursor: ${pagination.page === 1 ? 'not-allowed' : 'pointer'};
        font-weight: 500;
    `;
    
    if (pagination.page > 1) {
        prevBtn.addEventListener('click', () => {
            currentSetsPage = pagination.page - 1;
            loadPokemonSets(currentSetsPage);
        });
    }
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
    pageInfo.style.cssText = `
        color: #6b7280;
        font-weight: 500;
        min-width: 120px;
        text-align: center;
    `;
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = pagination.page === pagination.pages;
    nextBtn.style.cssText = `
        padding: 0.5rem 1rem;
        border: 1px solid #e5e7eb;
        background: ${pagination.page === pagination.pages ? '#f9fafb' : 'white'};
        color: ${pagination.page === pagination.pages ? '#9ca3af' : '#374151'};
        border-radius: 6px;
        cursor: ${pagination.page === pagination.pages ? 'not-allowed' : 'pointer'};
        font-weight: 500;
    `;
    
    if (pagination.page < pagination.pages) {
        nextBtn.addEventListener('click', () => {
            currentSetsPage = pagination.page + 1;
            loadPokemonSets(currentSetsPage);
        });
    }
    
    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextBtn);
    
    container.appendChild(paginationDiv);
}

// View set details function with pagination
async function viewSetDetails(setSlug, setName, page = 1) {
    try {
        const cardsPerPage = 24; // Show 24 cards per page (6x4 grid)
        const response = await fetch(`/api/cards/set/${setSlug}?page=${page}&limit=${cardsPerPage}`);
        const data = await response.json();
        
        if (data.success) {
            // Check if set has cards
            if (data.data.length === 0 && page === 1) {
                alert(`No cards found for ${setName}

This set appears to be empty in our database. It may be a placeholder or the cards haven't been imported yet.`);
                return;
            }
            
            // Create modal content with pagination
            const modalId = 'setDetailsModal';
            
            // Remove existing modal if it exists
            const existingModal = document.getElementById(modalId);
            if (existingModal) {
                existingModal.remove();
            }
            
            const modalDiv = document.createElement('div');
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
            
            const modalContent = document.createElement('div');
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
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
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
            const header = document.createElement('div');
            header.innerHTML = `
                <h2 style="margin-bottom: 0.5rem; color: #1f2937;">${setName}</h2>
                <p style="margin-bottom: 2rem; color: #6b7280;">
                    ${data.pagination ? `${data.pagination.total} total cards` : `${data.data.length} cards`}
                    ${data.pagination && data.pagination.pages > 1 ? ` • Page ${data.pagination.page} of ${data.pagination.pages}` : ''}
                </p>
            `;
            
            // Cards grid
            const cardsGrid = document.createElement('div');
            cardsGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            `;
            
            data.data.forEach(card => {
                // Get price - handle missing marketData
                let price = '25';
                if (card.marketData && card.marketData.averagePrice && card.marketData.averagePrice.raw) {
                    price = card.marketData.averagePrice.raw;
                }
                
                const cardElement = document.createElement('div');
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
                
                // Add hover effect
                cardElement.addEventListener('mouseenter', () => {
                    cardElement.style.transform = 'translateY(-2px)';
                    cardElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                });
                
                cardElement.addEventListener('mouseleave', () => {
                    cardElement.style.transform = 'translateY(0)';
                    cardElement.style.boxShadow = 'none';
                });
                
                cardsGrid.appendChild(cardElement);
            });
            
            // Pagination controls
            const paginationDiv = document.createElement('div');
            if (data.pagination && data.pagination.pages > 1) {
                paginationDiv.style.cssText = `
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 0;
                    border-top: 1px solid #e5e7eb;
                `;
                
                // Previous button
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '← Previous';
                prevBtn.disabled = data.pagination.page === 1;
                prevBtn.style.cssText = `
                    padding: 0.5rem 1rem;
                    border: 1px solid #e5e7eb;
                    background: ${data.pagination.page === 1 ? '#f9fafb' : 'white'};
                    color: ${data.pagination.page === 1 ? '#9ca3af' : '#374151'};
                    border-radius: 6px;
                    cursor: ${data.pagination.page === 1 ? 'not-allowed' : 'pointer'};
                    font-weight: 500;
                `;
                
                if (data.pagination.page > 1) {
                    prevBtn.addEventListener('click', () => {
                        viewSetDetails(setSlug, setName, data.pagination.page - 1);
                    });
                }
                
                // Page info
                const pageInfo = document.createElement('span');
                pageInfo.textContent = `Page ${data.pagination.page} of ${data.pagination.pages}`;
                pageInfo.style.cssText = `
                    color: #6b7280;
                    font-weight: 500;
                    min-width: 120px;
                    text-align: center;
                `;
                
                // Next button
                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Next →';
                nextBtn.disabled = data.pagination.page === data.pagination.pages;
                nextBtn.style.cssText = `
                    padding: 0.5rem 1rem;
                    border: 1px solid #e5e7eb;
                    background: ${data.pagination.page === data.pagination.pages ? '#f9fafb' : 'white'};
                    color: ${data.pagination.page === data.pagination.pages ? '#9ca3af' : '#374151'};
                    border-radius: 6px;
                    cursor: ${data.pagination.page === data.pagination.pages ? 'not-allowed' : 'pointer'};
                    font-weight: 500;
                `;
                
                if (data.pagination.page < data.pagination.pages) {
                    nextBtn.addEventListener('click', () => {
                        viewSetDetails(setSlug, setName, data.pagination.page + 1);
                    });
                }
                
                paginationDiv.appendChild(prevBtn);
                paginationDiv.appendChild(pageInfo);
                paginationDiv.appendChild(nextBtn);
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
    } catch (error) {
        console.error('Error loading set details:', error);
        alert('Error loading set details. Please try again.');
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedCards();
    loadTrendingCards();
    loadPokemonSets();
});

// Auto-login for demo purposes (remove in production)
setTimeout(() => {
    if (!isLoggedIn) {
        console.log('Auto-logging in for demo...');
        // Uncomment the next line to auto-login for demo
        // if (loginForm) loginForm.dispatchEvent(new Event('submit'));
    }
}, 2000);

console.log('CardTracker loaded successfully!');
console.log('Click "Sign In" to see your personal dashboard with portfolio tracking!');
console.log('Loading real card data from database...');
