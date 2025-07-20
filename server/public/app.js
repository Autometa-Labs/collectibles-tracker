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
        const response = await fetch('/api/cards');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const featuredCardsContainer = document.getElementById('featuredCards');
            if (!featuredCardsContainer) return;
            
            featuredCardsContainer.innerHTML = '';
            
            data.data.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                
                // Calculate price change (mock data for demo)
                const priceChange = Math.random() > 0.5 ? '+' : '-';
                const changePercent = (Math.random() * 10 + 1).toFixed(1);
                const changeClass = priceChange === '+' ? 'price-up' : 'price-down';
                
                cardElement.innerHTML = `
                    <div class="card-image">
                        ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : 'Card Image'}
                    </div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-set">${card.set.name} • ${card.rarity}</div>
                    <div class="card-price">$${card.marketData.averagePrice.raw}.00 <span class="price-change ${changeClass}">${priceChange}${changePercent}%</span></div>
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
        const response = await fetch('/api/cards');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const trendingContainer = document.getElementById('trendingCards');
            if (!trendingContainer) return;
            
            trendingContainer.innerHTML = '';
            
            // Use the first few cards as "trending" with mock price changes
            data.data.slice(0, 4).forEach(card => {
                const trendingItem = document.createElement('div');
                trendingItem.className = 'trending-item';
                
                // Generate mock trending data
                const isPositive = Math.random() > 0.3; // 70% chance of positive trend
                const changePercent = (Math.random() * 15 + 1).toFixed(1);
                const changeClass = isPositive ? 'price-up' : 'price-down';
                const changeSymbol = isPositive ? '+' : '-';
                
                trendingItem.innerHTML = `
                    <div class="trending-info">
                        <h4>${card.name}</h4>
                        <p>${card.set.name} • ${card.rarity}</p>
                    </div>
                    <div class="trending-price">
                        <div class="card-price">$${card.marketData.averagePrice.raw}.00</div>
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

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedCards();
    loadTrendingCards();
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
