// Settings and state management
const settings = {
    searxngUrl: 'https://unvertiginously-photic-tobi.ngrok-free.dev',
    language: 'en',
    darkMode: false,
    blurEnabled: true,
    safeSearch: true
};

// DOM Elements
const landingSearchInput = document.getElementById('landingSearchInput');
const landingSearchBtn = document.getElementById('landingSearchBtn');
const headerSearchInput = document.getElementById('headerSearchInput');
const headerSearchBtn = document.getElementById('headerSearchBtn');
const landing = document.getElementById('landing');
const header = document.getElementById('header');
const categories = document.getElementById('categories');
const categoryBtns = document.querySelectorAll('.category-btn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const logoHome = document.getElementById('logoHome');

// Settings
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.getElementById('closeSettings');
const searxngUrlInput = document.getElementById('searxngUrl');
const searchLanguageSelect = document.getElementById('searchLanguage');
const darkModeToggle = document.getElementById('darkModeToggle');
const blurToggle = document.getElementById('blurToggle');
const safeSearchToggle = document.getElementById('safeSearchToggle');
const themeToggle = document.getElementById('themeToggle');

// Translator
const translatorPanel = document.getElementById('translatorPanel');
const translatorBtn = document.getElementById('translatorBtn');
const closeTranslator = document.getElementById('closeTranslator');
const translateInput = document.getElementById('translateInput');
const translateBtn = document.getElementById('translateBtn');
const translateResult = document.getElementById('translateResult');
const fromLang = document.getElementById('fromLang');
const toLang = document.getElementById('toLang');

let currentCategory = 'general';
let currentQuery = '';

// Initialize
searxngUrlInput.value = settings.searxngUrl;
searchLanguageSelect.value = settings.language;

// Apply blur effect
function applyBlurEffect(enabled) {
    const elements = document.querySelectorAll('.header, .result-item, .translator-panel, .modal-content');
    elements.forEach(el => {
        if (enabled) {
            el.style.backdropFilter = 'blur(10px)';
            el.style.webkitBackdropFilter = 'blur(10px)';
        } else {
            el.style.backdropFilter = 'none';
            el.style.webkitBackdropFilter = 'none';
        }
    });
}

// Settings Modal
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    saveSettings();
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
        saveSettings();
    }
});

function saveSettings() {
    settings.searxngUrl = searxngUrlInput.value;
    settings.language = searchLanguageSelect.value;
    settings.darkMode = darkModeToggle.classList.contains('active');
    settings.blurEnabled = blurToggle.classList.contains('active');
    settings.safeSearch = safeSearchToggle.classList.contains('active');
}

// Toggle switches
[darkModeToggle, blurToggle, safeSearchToggle].forEach(toggle => {
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        
        if (toggle === darkModeToggle) {
            document.body.classList.toggle('dark-mode');
            themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        } else if (toggle === blurToggle) {
            applyBlurEffect(toggle.classList.contains('active'));
        }
    });
});

// Theme toggle button
themeToggle.addEventListener('click', () => {
    darkModeToggle.click();
});

// Translator
translatorBtn.addEventListener('click', () => {
    translatorPanel.classList.toggle('active');
});

closeTranslator.addEventListener('click', () => {
    translatorPanel.classList.remove('active');
});

translateBtn.addEventListener('click', async () => {
    const text = translateInput.value.trim();
    if (!text) return;

    translateResult.textContent = 'Translating...';
    
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang.value}&tl=${toLang.value}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        const translated = data[0].map(item => item[0]).join('');
        translateResult.textContent = translated;
    } catch (error) {
        translateResult.textContent = 'Translation failed. Please try again.';
        console.error('Translation error:', error);
    }
});

// Search functionality
async function performSearch(query, category = 'general') {
    if (!query.trim()) return;

    currentQuery = query;
    currentCategory = category;

    // Show results interface
    landing.style.display = 'none';
    header.style.display = 'block';
    categories.style.display = 'flex';
    
    // Update header search input
    headerSearchInput.value = query;

    // Show loading
    loading.classList.add('active');
    results.innerHTML = '';

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            language: settings.language,
            safesearch: settings.safeSearch ? '1' : '0',
            categories: category
        });

        const response = await fetch(`${settings.searxngUrl}/search?${params}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        loading.classList.remove('active');
        displayResults(data, category);
    } catch (error) {
        loading.classList.remove('active');
        results.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">⚠️</div>
                <h3>Search Error</h3>
                <p>Unable to connect to search service. Please check your SearXNG URL in settings.</p>
                <p style="font-size: 12px; margin-top: 10px; color: var(--text-tertiary);">Error: ${error.message}</p>
            </div>
        `;
        console.error('Search error:', error);
    }
}

function displayResults(data, category) {
    if (!data.results || data.results.length === 0) {
        results.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No Results Found</h3>
                <p>Try adjusting your search terms or category.</p>
            </div>
        `;
        return;
    }

    if (category === 'images') {
        displayImageResults(data.results);
    } else if (category === 'videos') {
        displayVideoResults(data.results);
    } else {
        displayGeneralResults(data.results);
    }
}

function displayGeneralResults(searchResults) {
    results.innerHTML = searchResults.map(result => `
        <div class="result-item">
            <div class="result-title">
                <a href="${result.url}" target="_blank">${result.title}</a>
            </div>
            <div class="result-url">${result.url}</div>
            <div class="result-content">${result.content || ''}</div>
            ${result.content ? '<button class="translate-btn" onclick="translateText(this)">Translate</button>' : ''}
        </div>
    `).join('');
}

function displayImageResults(searchResults) {
    results.innerHTML = '<div class="image-results">' +
        searchResults.map(result => `
            <div class="image-item" onclick="window.open('${result.url}', '_blank')">
                <img src="${result.img_src || result.thumbnail_src}" alt="${result.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="image-item-info">
                    <div class="image-item-title">${result.title}</div>
                </div>
            </div>
        `).join('') +
    '</div>';
}

function displayVideoResults(searchResults) {
    results.innerHTML = '<div class="video-results">' +
        searchResults.map(result => `
            <div class="video-item" onclick="window.open('${result.url}', '_blank')">
                <div class="video-thumbnail">
                    ${result.thumbnail ? `<img src="${result.thumbnail}" alt="${result.title}">` : ''}
                    <div class="play-icon">▶</div>
                </div>
                <div class="video-info">
                    <div class="video-title">${result.title}</div>
                    ${result.length ? `<div class="video-duration">${result.length}</div>` : ''}
                </div>
            </div>
        `).join('') +
    '</div>';
}

// Translate text from result
window.translateText = async function(button) {
    const content = button.previousElementSibling.textContent;
    translateInput.value = content;
    translatorPanel.classList.add('active');
};

// Search event listeners
landingSearchBtn.addEventListener('click', () => {
    performSearch(landingSearchInput.value);
});

landingSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(landingSearchInput.value);
    }
});

headerSearchBtn.addEventListener('click', () => {
    performSearch(headerSearchInput.value, currentCategory);
});

headerSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(headerSearchInput.value, currentCategory);
    }
});

// Logo home button
logoHome.addEventListener('click', () => {
    header.style.display = 'none';
    categories.style.display = 'none';
    landing.style.display = 'block';
    results.innerHTML = '';
    landingSearchInput.value = '';
    headerSearchInput.value = '';
    currentQuery = '';
});

// Category buttons
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        if (currentQuery) {
            performSearch(currentQuery, category);
        }
    });
});
