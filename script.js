// CryptoShifts - Enhanced with Gamification, Quizzes & Interactive Charts
// Created by: Mili, Haleigh, Boris, and Amina - RIT 2025

// ========================================
// API CONFIGURATION
// ========================================
const API_NINJAS_KEY = '3bfVQ5lCQSwpSW8uQ1WYgQ==tSIcWPx3Qatwfht1';

// ========================================
// GAMIFICATION SYSTEM - XP & LEVELS
// ========================================
const XP_LEVELS = [
    { level: 1, xpRequired: 0, title: "Crypto Newbie" },
    { level: 2, xpRequired: 100, title: "Digital Explorer" },
    { level: 3, xpRequired: 250, title: "Blockchain Learner" },
    { level: 4, xpRequired: 500, title: "Crypto Enthusiast" },
    { level: 5, xpRequired: 1000, title: "Digital Currency Expert" },
    { level: 6, xpRequired: 1500, title: "Blockchain Master" },
    { level: 7, xpRequired: 2500, title: "Crypto Guru" },
    { level: 8, xpRequired: 4000, title: "Financial Visionary" },
    { level: 9, xpRequired: 6000, title: "DeFi Legend" },
    { level: 10, xpRequired: 10000, title: "Crypto Master" }
];

const BADGES = [
    { id: 'first_visit', name: 'First Steps', icon: '🚀', description: 'Visited CryptoShifts for the first time', xp: 0, earned: false },
    { id: 'page_explorer', name: 'Page Explorer', icon: '🗺️', description: 'Visited all pages', xp: 0, earned: false },
    { id: 'quiz_starter', name: 'Quiz Starter', icon: '📝', description: 'Completed your first quiz', xp: 0, earned: false },
    { id: 'quiz_master', name: 'Quiz Master', icon: '🎓', description: 'Completed all quizzes', xp: 0, earned: false },
    { id: 'perfect_score', name: 'Perfect Score', icon: '💯', description: 'Got 100% on any quiz', xp: 0, earned: false },
    { id: 'calculator_user', name: 'Calculator Pro', icon: '🧮', description: 'Used the ROI calculator', xp: 0, earned: false },
    { id: 'chart_viewer', name: 'Market Analyst', icon: '📊', description: 'Viewed the price charts', xp: 0, earned: false },
    { id: 'level_5', name: 'Expert Status', icon: '⭐', description: 'Reached level 5', xp: 0, earned: false },
    { id: 'level_10', name: 'Crypto Master', icon: '👑', description: 'Reached level 10', xp: 0, earned: false },
    { id: 'tooltip_hunter', name: 'Tooltip Hunter', icon: '🔍', description: 'Hovered over 5 tooltips', xp: 0, earned: false },
    { id: 'dedicated_learner', name: 'Dedicated Learner', icon: '📚', description: 'Earned 500 XP', xp: 0, earned: false },
    { id: 'quiz_streak', name: 'Quiz Streak', icon: '🔥', description: 'Completed 3 quizzes in a row without mistakes', xp: 0, earned: false }
];

let gameState = {
    xp: 0,
    level: 1,
    badges: [...BADGES],
    pagesVisited: [],
    quizzesCompleted: [],
    tooltipsHovered: 0,
    calculatorUsed: false,
    chartViewed: false,
    quizStreak: 0
};

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('cryptoShiftsGameState');
    if (saved) {
        const loaded = JSON.parse(saved);
        gameState = { ...gameState, ...loaded };
        // Merge badges to keep new badges if added
        const savedBadgeIds = loaded.badges.map(b => b.id);
        gameState.badges = gameState.badges.map(badge => {
            const savedBadge = loaded.badges.find(b => b.id === badge.id);
            return savedBadge || badge;
        });
    } else {
        // First visit badge
        awardBadge('first_visit');
    }
    updateXPDisplay();
    updateBadgeCount();
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('cryptoShiftsGameState', JSON.stringify(gameState));
}

// Add XP with animation
function addXP(amount, reason = '') {
    gameState.xp += amount;
    
    // Check for level up
    const newLevel = calculateLevel(gameState.xp);
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        showLevelUpNotification(newLevel);
        
        // Award level badges
        if (newLevel === 5) awardBadge('level_5');
        if (newLevel === 10) awardBadge('level_10');
    }
    
    // Check for XP milestone badges
    if (gameState.xp >= 500 && !gameState.badges.find(b => b.id === 'dedicated_learner').earned) {
        awardBadge('dedicated_learner');
    }
    
    updateXPDisplay();
    saveGameState();
    
    // Show XP notification
    if (reason) {
        showNotification(`+${amount} XP - ${reason}`, 'success');
    }
}

// Calculate level based on XP
function calculateLevel(xp) {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= XP_LEVELS[i].xpRequired) {
            return XP_LEVELS[i].level;
        }
    }
    return 1;
}

// Get XP required for next level
function getXPForNextLevel(currentLevel) {
    const nextLevelData = XP_LEVELS.find(l => l.level === currentLevel + 1);
    return nextLevelData ? nextLevelData.xpRequired : XP_LEVELS[XP_LEVELS.length - 1].xpRequired;
}

// Update XP display
function updateXPDisplay() {
    const level = gameState.level;
    const currentLevelXP = XP_LEVELS.find(l => l.level === level).xpRequired;
    const nextLevelXP = getXPForNextLevel(level);
    const xpInCurrentLevel = gameState.xp - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const percentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
    
    document.getElementById('userLevel').textContent = level;
    document.getElementById('currentXP').textContent = gameState.xp;
    document.getElementById('xpToNextLevel').textContent = nextLevelXP;
    document.getElementById('xpProgress').style.width = Math.min(percentage, 100) + '%';
}

// Award badge
function awardBadge(badgeId) {
    const badge = gameState.badges.find(b => b.id === badgeId);
    if (badge && !badge.earned) {
        badge.earned = true;
        updateBadgeCount();
        saveGameState();
        showBadgeNotification(badge);
    }
}

// Update badge count
function updateBadgeCount() {
    const earnedCount = gameState.badges.filter(b => b.earned).length;
    document.getElementById('badgeCount').textContent = earnedCount;
}

// Show level up notification
function showLevelUpNotification(newLevel) {
    const levelData = XP_LEVELS.find(l => l.level === newLevel);
    showNotification(`🎉 Level Up! You're now Level ${newLevel}: ${levelData.title}`, 'levelup');
}

// Show badge notification
function showBadgeNotification(badge) {
    showNotification(`🏆 Badge Earned: ${badge.icon} ${badge.name}`, 'badge');
}

// Generic notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show badges modal
function showBadges() {
    const modal = document.getElementById('badgesModal');
    const grid = document.getElementById('badgesGrid');
    
    grid.innerHTML = '';
    gameState.badges.forEach(badge => {
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${badge.earned ? 'earned' : 'locked'}`;
        badgeCard.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">${badge.description}</div>
            ${badge.earned ? '<div class="badge-status">✓ Earned</div>' : '<div class="badge-status">🔒 Locked</div>'}
        `;
        grid.appendChild(badgeCard);
    });
    
    modal.style.display = 'block';
}

// Close badges modal
function closeBadges() {
    document.getElementById('badgesModal').style.display = 'none';
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        localStorage.removeItem('cryptoShiftsGameState');
        gameState = {
            xp: 0,
            level: 1,
            badges: BADGES.map(b => ({ ...b, earned: false })),
            pagesVisited: [],
            quizzesCompleted: [],
            tooltipsHovered: 0,
            calculatorUsed: false,
            chartViewed: false,
            quizStreak: 0
        };
        awardBadge('first_visit');
        updateXPDisplay();
        updateBadgeCount();
        saveGameState();
        closeBadges();
        showNotification('Progress reset successfully!', 'info');
    }
}

// ========================================
// QUIZ SYSTEM
// ========================================
const QUIZZES = {
    basics: {
        title: "Cryptocurrency Basics",
        questions: [
            {
                question: "What technology underlies most cryptocurrencies?",
                options: ["Cloud Computing", "Blockchain", "Artificial Intelligence", "Quantum Computing"],
                correct: 1
            },
            {
                question: "What does CBDC stand for?",
                options: ["Crypto Blockchain Digital Currency", "Central Bank Digital Currency", "Commercial Banking Digital Coin", "Centralized Bitcoin Development Center"],
                correct: 1
            },
            {
                question: "What is a stablecoin typically pegged to?",
                options: ["Gold", "Bitcoin", "Fiat currency like USD", "Ethereum"],
                correct: 2
            },
            {
                question: "What is the main characteristic of fiat currency?",
                options: ["Backed by physical gold", "Issued by government authority", "Completely decentralized", "Anonymous transactions"],
                correct: 1
            },
            {
                question: "Which best describes blockchain?",
                options: ["A centralized database", "A distributed ledger technology", "A type of cryptocurrency", "A government regulation"],
                correct: 1
            }
        ]
    },
    "pros-cons": {
        title: "Cryptocurrency Pros & Cons",
        questions: [
            {
                question: "What is a major advantage of cryptocurrency over traditional banking?",
                options: ["Government insurance", "Faster international transactions", "No price volatility", "Easier to use"],
                correct: 1
            },
            {
                question: "What is a significant challenge facing cryptocurrency adoption?",
                options: ["Too much stability", "Excessive regulation clarity", "Price volatility", "Too slow transactions"],
                correct: 2
            },
            {
                question: "What is a key strength of fiat currency?",
                options: ["Completely anonymous", "Generally stable value", "No government control", "Instant global transfers"],
                correct: 1
            },
            {
                question: "Which is true about cryptocurrency accessibility?",
                options: ["Requires a bank account", "Available 24/7 globally", "Only works in certain countries", "Needs government approval"],
                correct: 1
            },
            {
                question: "What is a limitation of fiat currency?",
                options: ["Too volatile", "Subject to inflation", "No consumer protection", "Too fast transactions"],
                correct: 1
            }
        ]
    },
    global: {
        title: "Global Cryptocurrency Impact",
        questions: [
            {
                question: "When was Bitcoin first introduced?",
                options: ["2005", "2009", "2015", "2020"],
                correct: 1
            },
            {
                question: "Which country adopted Bitcoin as legal tender?",
                options: ["United States", "China", "El Salvador", "Switzerland"],
                correct: 2
            },
            {
                question: "What year did Ethereum launch, enabling smart contracts?",
                options: ["2009", "2013", "2015", "2018"],
                correct: 2
            },
            {
                question: "Which region is leading in CBDC development with the digital yuan?",
                options: ["Europe", "Americas", "Asia", "Africa"],
                correct: 2
            },
            {
                question: "What does MiCA stand for in EU crypto regulation?",
                options: ["Markets in Crypto-Assets", "Major International Crypto Alliance", "Monetary Investment in Cryptocurrency Act", "Modern Infrastructure for Crypto Adoption"],
                correct: 0
            }
        ]
    },
    market: {
        title: "Cryptocurrency Markets",
        questions: [
            {
                question: "Approximately how many cryptocurrency users are there worldwide?",
                options: ["50 million", "200 million", "420 million", "1 billion"],
                correct: 2
            },
            {
                question: "What is the global cryptocurrency market cap?",
                options: ["Over $500 billion", "Over $1 trillion", "Over $2 trillion", "Over $5 trillion"],
                correct: 2
            },
            {
                question: "What is the predicted future of money according to experts?",
                options: ["Crypto will replace all fiat", "Fiat will eliminate crypto", "Hybrid coexistence of both", "Return to gold standard"],
                correct: 2
            },
            {
                question: "Which cryptocurrencies dominate market share?",
                options: ["Dogecoin and Litecoin", "Bitcoin and Ethereum", "Ripple and Cardano", "Tether and USDC"],
                correct: 1
            },
            {
                question: "What role will stablecoins likely play in the future?",
                options: ["Replace all cryptocurrencies", "Regulated bridges between systems", "Be banned globally", "Replace central banks"],
                correct: 1
            }
        ]
    }
};

let currentQuiz = null;
let currentQuestionIndex = 0;
let quizAnswers = [];

// Start quiz
function startQuiz(quizId) {
    currentQuiz = QUIZZES[quizId];
    currentQuestionIndex = 0;
    quizAnswers = [];
    
    const container = document.getElementById(`quizContent-${quizId}`);
    const startButton = document.getElementById(`startQuiz-${quizId}`);
    
    startButton.style.display = 'none';
    displayQuestion(quizId);
}

// Display question
function displayQuestion(quizId) {
    const question = currentQuiz.questions[currentQuestionIndex];
    const container = document.getElementById(`quizContent-${quizId}`);
    
    container.innerHTML = `
        <div class="quiz-question">
            <div class="question-number">Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</div>
            <h3>${question.question}</h3>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <button class="quiz-option" onclick="selectAnswer(${index}, '${quizId}')">${option}</button>
                `).join('')}
            </div>
        </div>
    `;
}

// Select answer
function selectAnswer(answerIndex, quizId) {
    const question = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;
    
    quizAnswers.push({
        questionIndex: currentQuestionIndex,
        selectedAnswer: answerIndex,
        correct: isCorrect
    });
    
    // Show feedback
    const container = document.getElementById(`quizContent-${quizId}`);
    const options = container.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        option.disabled = true;
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === answerIndex && !isCorrect) {
            option.classList.add('incorrect');
        }
    });
    
    // Wait before next question
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.questions.length) {
            displayQuestion(quizId);
        } else {
            showQuizResults(quizId);
        }
    }, 1500);
}

// Show quiz results
function showQuizResults(quizId) {
    const correctCount = quizAnswers.filter(a => a.correct).length;
    const totalQuestions = currentQuiz.questions.length;
    const percentage = (correctCount / totalQuestions) * 100;
    
    const container = document.getElementById(`quizContent-${quizId}`);
    const startButton = document.getElementById(`startQuiz-${quizId}`);
    
    // Award XP
    const xpEarned = 50;
    addXP(xpEarned, `Completed ${currentQuiz.title} quiz`);
    
    // Track quiz completion
    if (!gameState.quizzesCompleted.includes(quizId)) {
        gameState.quizzesCompleted.push(quizId);
        
        // Award badges
        if (gameState.quizzesCompleted.length === 1) {
            awardBadge('quiz_starter');
        }
        if (gameState.quizzesCompleted.length === Object.keys(QUIZZES).length) {
            awardBadge('quiz_master');
        }
    }
    
    // Perfect score badge
    if (percentage === 100) {
        awardBadge('perfect_score');
        gameState.quizStreak++;
        if (gameState.quizStreak >= 3) {
            awardBadge('quiz_streak');
        }
    } else {
        gameState.quizStreak = 0;
    }
    
    saveGameState();
    
    container.innerHTML = `
        <div class="quiz-results">
            <h3>Quiz Complete!</h3>
            <div class="result-score ${percentage === 100 ? 'perfect' : percentage >= 80 ? 'great' : percentage >= 60 ? 'good' : 'needs-improvement'}">
                ${correctCount} / ${totalQuestions} Correct (${percentage.toFixed(0)}%)
            </div>
            <div class="result-message">
                ${percentage === 100 ? '🎉 Perfect Score! You\'re a master!' :
                  percentage >= 80 ? '🌟 Great job! You know your stuff!' :
                  percentage >= 60 ? '👍 Good work! Keep learning!' :
                  '📚 Keep studying and try again!'}
            </div>
            <div class="xp-earned">+${xpEarned} XP Earned!</div>
            <button onclick="retakeQuiz('${quizId}')" class="quiz-btn">Retake Quiz</button>
        </div>
    `;
}

// Retake quiz
function retakeQuiz(quizId) {
    const container = document.getElementById(`quizContent-${quizId}`);
    const startButton = document.getElementById(`startQuiz-${quizId}`);
    
    container.innerHTML = '';
    startButton.style.display = 'block';
    startButton.textContent = 'Retake Quiz';
}

// ========================================
// INTERACTIVE PRICE CHARTS
// ========================================
let priceChart = null;
let currentCrypto = 'bitcoin';
let currentTimeframe = '24h';
let chartData = {
    bitcoin: { prices: [], timestamps: [] },
    ethereum: { prices: [], timestamps: [] }
};

// Initialize chart
function initializeChart() {
    const ctx = document.getElementById('priceChart');
    if (!ctx) return;
    
    // Award badge for viewing chart
    if (!gameState.chartViewed) {
        gameState.chartViewed = true;
        awardBadge('chart_viewer');
        addXP(20, 'Viewed price charts');
        saveGameState();
    }
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price (USD)',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 10
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
    
    generateChartData();
}

// Generate simulated historical data
function generateChartData() {
    const now = Date.now();
    const basePrice = currentCrypto === 'bitcoin' ? 91000 : 3200;
    
    // Generate data points based on timeframe
    let dataPoints = 24; // Default for 24h
    let interval = 60 * 60 * 1000; // 1 hour
    
    switch(currentTimeframe) {
        case '1h':
            dataPoints = 60;
            interval = 60 * 1000; // 1 minute
            break;
        case '24h':
            dataPoints = 24;
            interval = 60 * 60 * 1000; // 1 hour
            break;
        case '7d':
            dataPoints = 168;
            interval = 60 * 60 * 1000; // 1 hour
            break;
        case '30d':
            dataPoints = 30;
            interval = 24 * 60 * 60 * 1000; // 1 day
            break;
    }
    
    const prices = [];
    const timestamps = [];
    let price = basePrice;
    
    for (let i = dataPoints; i >= 0; i--) {
        // Simulate price movement with random walk
        const change = (Math.random() - 0.5) * basePrice * 0.02;
        price = Math.max(price + change, basePrice * 0.8);
        prices.push(price);
        timestamps.push(new Date(now - (i * interval)));
    }
    
    chartData[currentCrypto] = { prices, timestamps };
    updateChart();
}

// Update chart with current data
function updateChart() {
    if (!priceChart) return;
    
    const data = chartData[currentCrypto];
    const labels = data.timestamps.map(ts => {
        const date = new Date(ts);
        if (currentTimeframe === '1h') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (currentTimeframe === '24h') {
            return date.toLocaleTimeString([], { hour: '2-digit' });
        } else if (currentTimeframe === '7d') {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    });
    
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = data.prices;
    priceChart.data.datasets[0].label = `${currentCrypto.charAt(0).toUpperCase() + currentCrypto.slice(1)} Price (USD)`;
    priceChart.update();
    
    updateChartStats();
}

// Update chart statistics
function updateChartStats() {
    const data = chartData[currentCrypto];
    const prices = data.prices;
    const currentPrice = prices[prices.length - 1];
    const startPrice = prices[0];
    const change = ((currentPrice - startPrice) / startPrice) * 100;
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    
    document.getElementById('stat-price').textContent = '$' + currentPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    const changeEl = document.getElementById('stat-change');
    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    changeEl.className = 'stat-value ' + (change >= 0 ? 'positive' : 'negative');
    
    document.getElementById('stat-high').textContent = '$' + high.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    document.getElementById('stat-low').textContent = '$' + low.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Change chart cryptocurrency
function changeChartCrypto(crypto) {
    currentCrypto = crypto;
    
    // Update button states
    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + crypto).classList.add('active');
    
    generateChartData();
}

// Change chart timeframe
function changeTimeframe(timeframe) {
    currentTimeframe = timeframe;
    
    // Update button states
    document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('time-' + timeframe).classList.add('active');
    
    generateChartData();
}

// ========================================
// PAGE NAVIGATION SYSTEM
// ========================================
function showPage(pageName) {
    // Hide all pages
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById('page-' + pageName);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update active nav link
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Track page visits
    if (!gameState.pagesVisited.includes(pageName)) {
        gameState.pagesVisited.push(pageName);
        addXP(10, `Visited ${pageName} page`);
        
        // Check for page explorer badge
        const totalPages = 8; // home, basics, pros-cons, global, features, market, resources, contact
        if (gameState.pagesVisited.length >= totalPages) {
            awardBadge('page_explorer');
        }
        
        saveGameState();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.remove('active');
    }
    
    // Initialize chart if on market page
    if (pageName === 'market' && !priceChart) {
        setTimeout(initializeChart, 100);
    }
}

// ========================================
// THEME TOGGLE FUNCTIONALITY
// ========================================
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme + '-mode';
});

// ========================================
// MOBILE MENU TOGGLE
// ========================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// ========================================
// LIVE CRYPTO PRICE TICKER
// ========================================
let cryptoPrices = {};

async function fetchCryptoPrices() {
    try {
        const btcResponse = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=BTCUSDT', {
            headers: { 'X-Api-Key': API_NINJAS_KEY }
        });
        
        const ethResponse = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=ETHUSDT', {
            headers: { 'X-Api-Key': API_NINJAS_KEY }
        });

        if (!btcResponse.ok || !ethResponse.ok) {
            throw new Error('API request failed');
        }

        const btcData = await btcResponse.json();
        const ethData = await ethResponse.json();
        
        cryptoPrices = {
            bitcoin: { 
                usd: parseFloat(btcData.price),
                usd_24h_change: parseFloat(btcData['24h_price_change_percent'])
            },
            ethereum: { 
                usd: parseFloat(ethData.price),
                usd_24h_change: parseFloat(ethData['24h_price_change_percent'])
            }
        };
        
        updatePriceTicker();
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        cryptoPrices = {
            bitcoin: { usd: 91000, usd_24h_change: 1.85 },
            ethereum: { usd: 3200, usd_24h_change: -1.2 }
        };
        updatePriceTicker();
    }
}

function updatePriceTicker() {
    const btcPriceEl = document.getElementById('btcPrice');
    const btcChangeEl = document.getElementById('btcChange');
    
    if (btcPriceEl && cryptoPrices.bitcoin) {
        btcPriceEl.textContent = '$' + cryptoPrices.bitcoin.usd.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        if (btcChangeEl) {
            const change = cryptoPrices.bitcoin.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeIcon = change >= 0 ? '▲' : '▼';
            btcChangeEl.className = 'ticker-change ' + changeClass;
            btcChangeEl.textContent = changeIcon + ' ' + Math.abs(change).toFixed(2) + '%';
        }
    }
    
    const ethPriceEl = document.getElementById('ethPrice');
    const ethChangeEl = document.getElementById('ethChange');
    
    if (ethPriceEl && cryptoPrices.ethereum) {
        ethPriceEl.textContent = '$' + cryptoPrices.ethereum.usd.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        if (ethChangeEl) {
            const change = cryptoPrices.ethereum.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeIcon = change >= 0 ? '▲' : '▼';
            ethChangeEl.className = 'ticker-change ' + changeClass;
            ethChangeEl.textContent = changeIcon + ' ' + Math.abs(change).toFixed(2) + '%';
        }
    }
    
    const marketCapEl = document.getElementById('marketCap');
    if (marketCapEl && cryptoPrices.bitcoin && cryptoPrices.ethereum) {
        const estimatedMarketCap = (cryptoPrices.bitcoin.usd * 19500000 + cryptoPrices.ethereum.usd * 120000000) / 1000000000000;
        marketCapEl.textContent = '$' + estimatedMarketCap.toFixed(2) + 'T';
    }
    
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = 'Updated: ' + now.toLocaleTimeString();
    }
}

setInterval(fetchCryptoPrices, 60000);

// ========================================
// ROI CALCULATOR
// ========================================
function calculateROI() {
    const investment = parseFloat(document.getElementById('investment').value);
    const type = document.getElementById('investmentType').value;
    const years = parseFloat(document.getElementById('years').value);
    
    if (!investment || !years || investment <= 0 || years <= 0) {
        alert('Please enter valid positive numbers for investment and years');
        return;
    }

    // Award badge for using calculator
    if (!gameState.calculatorUsed) {
        gameState.calculatorUsed = true;
        awardBadge('calculator_user');
        addXP(20, 'Used ROI calculator');
        saveGameState();
    }

    const rates = {
        'savings': 0.005,
        'stocks': 0.07,
        'crypto': 0.15,
        'stablecoin': 0.05
    };

    const rate = rates[type];
    const futureValue = investment * Math.pow(1 + rate, years);
    const profit = futureValue - investment;
    const percentGain = ((profit / investment) * 100).toFixed(2);

    const resultDiv = document.getElementById('roiResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h4>Investment Results</h4>
        <p><strong>Initial Investment:</strong> $${investment.toLocaleString()}</p>
        <p><strong>Future Value:</strong> $${futureValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p><strong>Total Profit:</strong> $${profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p><strong>Percentage Gain:</strong> ${percentGain}%</p>
        ${type === 'crypto' ? '<p style="color: #f59e0b; margin-top: 10px;"><small>⚠️ Cryptocurrency is highly volatile. Past performance doesn\'t guarantee future results.</small></p>' : ''}
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// CONTACT FORM SUBMISSION
// ========================================
function submitContact() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const resultDiv = document.getElementById('contactResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p><strong>Thank you, ${name}!</strong></p>
        <p>Your message has been received. We'll respond to ${email} shortly.</p>
    `;

    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactSubject').value = '';
    document.getElementById('contactMessage').value = '';

    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 5000);

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// TOOLTIP TRACKING
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            if (gameState.tooltipsHovered < 100) { // Prevent overflow
                gameState.tooltipsHovered++;
                if (gameState.tooltipsHovered >= 5 && !gameState.badges.find(b => b.id === 'tooltip_hunter').earned) {
                    awardBadge('tooltip_hunter');
                    addXP(15, 'Discovered 5 tooltips');
                }
                saveGameState();
            }
        });
    });
});

// ========================================
// ANIMATE ELEMENTS ON SCROLL
// ========================================
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.card, .timeline-item');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

document.querySelectorAll('.card, .timeline-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('DOMContentLoaded', animateOnScroll);

// ========================================
// KEYBOARD NAVIGATION
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('active');
        
        const modal = document.getElementById('badgesModal');
        if (modal.style.display === 'block') closeBadges();
    }
    
    if (e.key === 'Enter' && (
        document.activeElement.id === 'investment' ||
        document.activeElement.id === 'years' ||
        document.activeElement.id === 'investmentType'
    )) {
        calculateROI();
    }
    
    if (e.key === 'Enter' && e.ctrlKey) {
        if (document.activeElement.id === 'contactMessage') {
            submitContact();
        }
    }
});

// ========================================
// NAVIGATION SHADOW ON SCROLL
// ========================================
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const nav = document.querySelector('nav');
    if (nav) {
        if (scrollTop > 50) {
            nav.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

// ========================================
// RESPONSIVE MENU HANDLING
// ========================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) {
            const navLinks = document.getElementById('navLinks');
            if (navLinks) navLinks.classList.remove('active');
        }
    }, 250);
});

// ========================================
// TOOLTIP ACCESSIBILITY
// ========================================
document.querySelectorAll('.tooltip').forEach(tooltip => {
    tooltip.setAttribute('tabindex', '0');
    tooltip.addEventListener('focus', function() {
        const tooltipText = this.querySelector('.tooltiptext');
        if (tooltipText) {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
        }
    });
    tooltip.addEventListener('blur', function() {
        const tooltipText = this.querySelector('.tooltiptext');
        if (tooltipText) {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
        }
    });
});

// ========================================
// INPUT VALIDATION
// ========================================
function validateNumber(value) {
    return !isNaN(value) && parseFloat(value) > 0;
}

const investmentInput = document.getElementById('investment');
const yearsInput = document.getElementById('years');

if (investmentInput) {
    investmentInput.addEventListener('input', function() {
        if (this.value && !validateNumber(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '';
        }
    });
}

if (yearsInput) {
    yearsInput.addEventListener('input', function() {
        if (this.value && !validateNumber(this.value)) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '';
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    console.log('🚀 CryptoShifts - Loaded Successfully!');
    
    // Load game state
    loadGameState();
    
    // Fetch initial crypto prices
    fetchCryptoPrices();
    
    // Show home page by default
    showPage('home');
    
    console.log('%c🔗 CryptoShifts', 'font-size: 24px; font-weight: bold; color: #6366f1;');
    console.log('%cUnderstanding the Future of Money', 'font-size: 14px; color: #8b5cf6;');
    console.log('%cCreated by: Mili, Haleigh, Boris, and Amina', 'font-size: 12px; color: #64748b;');
    console.log('%cRochester Institute of Technology - 2025', 'font-size: 12px; color: #64748b;');
});

// ========================================
// PERFORMANCE MONITORING
// ========================================
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${(loadTime / 1000).toFixed(2)} seconds`);
});