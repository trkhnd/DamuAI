// ============================================
// ELI5 HUB - Full Functional Site
// ============================================

// 🔑 GET YOUR FREE API KEY HERE (no credit card needed):
// https://console.groq.com/keys
// Then paste it below:
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';  // 👈 PASTE YOUR KEY HERE

// API Configuration
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// App State
let questionCount = parseInt(localStorage.getItem('eli5_questionCount') || 0);
let favorites = JSON.parse(localStorage.getItem('eli5_favorites') || '[]');

// DOM Elements
const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const surpriseBtn = document.getElementById('surpriseBtn');
const voiceBtn = document.getElementById('voiceBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultArea = document.getElementById('resultArea');
const explanationResult = document.getElementById('explanationResult');
const askedQuestion = document.getElementById('askedQuestion');
const saveFavoriteBtn = document.getElementById('saveFavoriteBtn');
const copyResultBtn = document.getElementById('copyResultBtn');
const shareBtn = document.getElementById('shareBtn');
const themeToggle = document.getElementById('themeToggle');
const favoritesList = document.getElementById('favoritesList');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
const questionCountSpan = document.getElementById('questionCount');
const favoriteCountSpan = document.getElementById('favoriteCount');

// ============================================
// Initialize App
// ============================================
function init() {
    updateStats();
    renderFavorites();
    loadTheme();
    setupEventListeners();
    setupSuggestions();
}

function updateStats() {
    questionCountSpan.textContent = questionCount;
    favoriteCountSpan.textContent = favorites.length;
}

function setupEventListeners() {
    askBtn.addEventListener('click', askQuestion);
    surpriseBtn.addEventListener('click', surpriseMe);
    voiceBtn.addEventListener('click', startVoiceInput);
    clearBtn.addEventListener('click', () => questionInput.value = '');
    saveFavoriteBtn.addEventListener('click', saveCurrentToFavorites);
    copyResultBtn.addEventListener('click', copyExplanation);
    shareBtn.addEventListener('click', shareExplanation);
    themeToggle.addEventListener('click', toggleTheme);
    clearFavoritesBtn.addEventListener('click', clearAllFavorites);
    
    questionInput.addEventListener('keypress', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            askQuestion();
        }
    });
}

function setupSuggestions() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            questionInput.value = chip.textContent;
            askQuestion();
        });
    });
}

// ============================================
// AI Question Answering
// ============================================
async function askQuestion() {
    const question = questionInput.value.trim();
    
    if (!question) {
        alert('Please ask a question!');
        return;
    }
    
    // Show loading
    loadingIndicator.classList.remove('hidden');
    resultArea.classList.add('hidden');
    
    try {
        const explanation = await callAI(question);
        
        // Increment question count
        questionCount++;
        localStorage.setItem('eli5_questionCount', questionCount);
        updateStats();
        
        // Display result
        explanationResult.innerHTML = formatExplanation(explanation);
        askedQuestion.textContent = question;
        resultArea.classList.remove('hidden');
        
        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Error:', error);
        explanationResult.innerHTML = `
            <p>😅 Oops! Something went wrong.</p>
            <p>Make sure you've added your Groq API key in script.js (line 12).</p>
            <p>Get a free key at: <a href="https://console.groq.com/keys" target="_blank">console.groq.com/keys</a></p>
        `;
        resultArea.classList.remove('hidden');
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

async function callAI(question) {
    // Check if API key is set
    if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
        throw new Error('Please add your Groq API key to script.js');
    }
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at explaining complex topics to a 5-year-old child. 
                    Use VERY simple words, fun analogies, short sentences, and keep explanations under 150 words. 
                    Be playful, use emojis, and make it memorable. Never use jargon without explaining it.`
                },
                {
                    role: 'user',
                    content: `Explain this like I'm 5 years old: ${question}`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function formatExplanation(text) {
    // Convert markdown-like formatting to HTML
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/🔗|🧠|🎲|🦜|🍪|🛡️|🌀/g, match => `<span style="font-size:1.3rem">${match}</span>`);
}

// ============================================
// Surprise Me Feature
// ============================================
const surpriseQuestions = [
    "How does a refrigerator work?",
    "Why do we have dreams?",
    "How do plants eat sunlight?",
    "What is a black hole?",
    "How does the internet work?",
    "Why do we have seasons?",
    "How do batteries work?",
    "What is the stock market?",
    "How do airplanes fly?",
    "What is artificial intelligence?"
];

function surpriseMe() {
    const randomIndex = Math.floor(Math.random() * surpriseQuestions.length);
    questionInput.value = surpriseQuestions[randomIndex];
    askQuestion();
}

// ============================================
// Voice Input
// ============================================
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Sorry, your browser doesn\'t support voice input!');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    voiceBtn.textContent = '🎙️ Listening...';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        questionInput.value = transcript;
        voiceBtn.textContent = '🎤';
    };
    
    recognition.onerror = () => {
        voiceBtn.textContent = '🎤';
        alert('Could not hear you. Please try again.');
    };
    
    recognition.onend = () => {
        voiceBtn.textContent = '🎤';
    };
}

// ============================================
// Favorites System
// ============================================
function saveCurrentToFavorites() {
    const question = askedQuestion.textContent;
    const explanation = explanationResult.innerText;
    
    if (!question || question === '') {
        alert('Nothing to save. Ask a question first!');
        return;
    }
    
    // Check if already exists
    if (favorites.some(fav => fav.question === question)) {
        alert('This is already in your favorites!');
        return;
    }
    
    favorites.unshift({ question, explanation, timestamp: Date.now() });
    
    // Keep only last 20 favorites
    if (favorites.length > 20) favorites.pop();
    
    localStorage.setItem('eli5_favorites', JSON.stringify(favorites));
    renderFavorites();
    updateStats();
    alert('✨ Saved to favorites!');
}

function renderFavorites() {
    if (!favoritesList) return;
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<li class="empty-fav">No favorites yet</li>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((fav, index) => `
        <li>
            <span class="favorite-question" data-index="${index}">${escapeHtml(fav.question)}</span>
            <button class="remove-fav" data-index="${index}">✖️</button>
        </li>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.favorite-question').forEach(el => {
        el.addEventListener('click', () => {
            const index = parseInt(el.dataset.index);
            loadFavorite(index);
        });
    });
    
    document.querySelectorAll('.remove-fav').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(el.dataset.index);
            removeFavorite(index);
        });
    });
}

function loadFavorite(index) {
    const fav = favorites[index];
    if (fav) {
        questionInput.value = fav.question;
        explanationResult.innerHTML = formatExplanation(fav.explanation);
        askedQuestion.textContent = fav.question;
        resultArea.classList.remove('hidden');
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('eli5_favorites', JSON.stringify(favorites));
    renderFavorites();
    updateStats();
}

function clearAllFavorites() {
    if (confirm('Delete all favorites? This cannot be undone.')) {
        favorites = [];
        localStorage.setItem('eli5_favorites', JSON.stringify(favorites));
        renderFavorites();
        updateStats();
    }
}

// ============================================
// Copy & Share
// ============================================
async function copyExplanation() {
    const text = explanationResult.innerText;
    try {
        await navigator.clipboard.writeText(text);
        copyResultBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyResultBtn.textContent = '📋 Copy';
        }, 2000);
    } catch (err) {
        alert('Failed to copy');
    }
}

async function shareExplanation() {
    const question = askedQuestion.textContent;
    const explanation = explanationResult.innerText;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'ELI5 Explanation',
                text: `Question: ${question}\n\nAnswer: ${explanation}`,
                url: window.location.href
            });
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        // Fallback
        copyExplanation();
        alert('Link copied to clipboard!');
    }
}

// ============================================
// Theme System
// ============================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('eli5_theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('eli5_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        themeToggle.textContent = '🌙 Dark Mode';
    }
}

// ============================================
// Utilities
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start the app
init();