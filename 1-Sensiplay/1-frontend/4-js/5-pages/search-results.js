// search-results.js
// 🔧 DEVELOPMENT: Frontend (Live Server 5500) + Backend (8080) separados
// API base: usa proxy quando rodando no Vite (porta 3000/5173), senão usa backend direto
const _origin = window.location.origin || '';
const API_BASE_URL = (_origin.includes(':3000') || _origin.includes(':5173')) ? '/api/movies' : 'http://localhost:8080/api/movies';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const modal = document.getElementById('movie-modal');
const closeBtn = document.querySelector('.close');
const modalTitle = document.getElementById('modal-title');
const modalOverview = document.getElementById('modal-overview');
const player = document.getElementById('movie-player');
const serverSelect = document.getElementById('server-select');
let currentMovieId = null;

function qs(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function fetchSearchResults(query) {
    try {
        const resp = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        if (!resp.ok) throw new Error('Erro backend');
        const data = await resp.json();
        return data.results || [];
    } catch (e) {
        console.error('Erro fetch search results', e);
        return [];
    }
}

function renderTop3(items) {
    const container = document.getElementById('top-3-row');
    container.innerHTML = '';
    items.slice(0,3).forEach(item => {
        const posterPath = item.poster_path || item.backdrop_path;
        if (!posterPath) return;
        const img = document.createElement('img');
        img.src = `${IMG_BASE_URL}${posterPath}`;
        img.onclick = () => openModal(item, item.media_type === 'tv' ? 'tv' : 'movie');
        container.appendChild(img);
    });
}

function renderGrid(items) {
    const grid = document.getElementById('grid-results');
    grid.innerHTML = '';
    items.forEach(item => {
        const posterPath = item.poster_path || item.backdrop_path;
        const card = document.createElement('div');
        card.className = 'grid-card';
        if (posterPath) {
            const img = document.createElement('img');
            img.src = `${IMG_BASE_URL}${posterPath}`;
            img.onclick = () => openModal(item, item.media_type === 'tv' ? 'tv' : 'movie');
            card.appendChild(img);
        }
        const title = document.createElement('div');
        title.className = 'grid-title';
        title.textContent = item.title || item.name || '';
        card.appendChild(title);
        grid.appendChild(card);
    });
}

function openModal(item, mediaType='movie') {
    currentMovieId = item.id;
    modalTitle.textContent = item.title || item.name || 'Título';
    modalOverview.textContent = item.overview || '';
    modal.setAttribute('data-media-type', mediaType);
    updatePlayerSource(serverSelect.value);
    modal.style.display = 'flex';
}

function updatePlayerSource(server) {
    if (!currentMovieId) return;
    const mediaType = modal.getAttribute('data-media-type') || 'movie';
    let embedUrl;
    if (mediaType === 'tv') {
        embedUrl = `https://player.autoembed.cc/embed/tv/${currentMovieId}/1/1?server=${server}`;
    } else {
        embedUrl = `https://player.autoembed.cc/embed/movie/${currentMovieId}?server=${server}`;
    }
    player.src = embedUrl;
}

closeBtn.onclick = () => { modal.style.display = 'none'; player.src = ''; };
window.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; player.src = ''; } };
if (serverSelect) serverSelect.onchange = () => updatePlayerSource(serverSelect.value);

// Suggestions & search redirection
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
let suggestionTimeout = null;

async function fetchSuggestions(query) {
    if (!query || query.length < 2) return [];
    const resp = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || []).slice(0,6);
}

function showSuggestions(items) {
    const box = document.getElementById('search-suggestions');
    box.innerHTML = '';
    if (!items || items.length === 0) { box.style.display = 'none'; return; }
    items.forEach(it => {
        const div = document.createElement('div');
        div.className = 'search-suggestion-item';
        div.textContent = (it.title || it.name || '');
        div.onclick = () => {
            window.location.href = `search-results.html?query=${encodeURIComponent(it.title || it.name || '')}`;
        };
        box.appendChild(div);
    });
    box.style.display = 'block';
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        if (suggestionTimeout) clearTimeout(suggestionTimeout);
        suggestionTimeout = setTimeout(async () => {
            const sug = await fetchSuggestions(q);
            showSuggestions(sug);
        }, 200);
    });
}
if (searchBtn) searchBtn.onclick = () => { const q = searchInput.value.trim(); if (q) window.location.href = `search-results.html?query=${encodeURIComponent(q)}`; };

// On load, run query from URL
document.addEventListener('DOMContentLoaded', async () => {
    const q = qs('query');
    const input = document.getElementById('search-input');
    if (input && q) input.value = q;
    if (!q) return;
    const results = await fetchSearchResults(q);
    const filtered = (results || []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
    if (!filtered || filtered.length === 0) {
        document.getElementById('no-results').style.display = 'block';
        return;
    }
    renderTop3(filtered.slice(0,3));
    renderGrid(filtered.slice(3));
});
