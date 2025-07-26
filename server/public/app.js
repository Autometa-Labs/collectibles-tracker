// Import modules
import { CardsManager } from './js/cards.js';
import { SetsManager } from './js/sets.js';
import { setupSmoothScrolling } from './js/utils.js';

// State management
let isLoggedIn = false;
let currentUser = null;

// Module instances
let cardsManager;
let setsManager;

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


// Initialize modules and load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize module instances
    cardsManager = new CardsManager();
    setsManager = new SetsManager();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Load all data
    cardsManager.loadAllCards();
    setsManager.loadPokemonSets();
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
