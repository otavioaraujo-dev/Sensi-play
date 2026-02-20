// 7-home.js - Gerenciar abas: Filmes, Séries, Esportes, TV Aberta
// Com suporte ao modal de player para filmes e séries

// 🔧 DEVELOPMENT: Frontend (Live Server 5500) + Backend (8080) separados
// API base: usa /api em todos os casos (proxy do Vite em dev, funções serverless na Vercel em prod)
const API_BASE_URL = '/api/movies';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Modal elements (compartilhado entre Filmes e Séries)
const modal = document.getElementById('movie-modal');
const closeBtn = document.querySelector('.close');
const modalTitle = document.getElementById('modal-title');
const modalOverview = document.getElementById('modal-overview');
const player = document.getElementById('movie-player');
const serverSelect = document.getElementById('server-select');

let currentMovieId = null;
let searchTimeout = null;
let suggestionTimeout = null;
let currentTab = 'filmes'; // rastreia aba ativa

// ============================================================================
// UTILITÁRIOS - Modal & Player
// ============================================================================

function openModal(item, mediaType = 'movie') {
    currentMovieId = item.id;
    const title = item.title || item.name || 'Título indisponível';
    modalTitle.textContent = title;
    modalOverview.textContent = item.overview || 'Sinopse não disponível.';
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
    console.log('Player:', embedUrl);
}

// Modal events
closeBtn.onclick = () => {
    modal.style.display = 'none';
    player.src = '';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        player.src = '';
    }
};

if (serverSelect) {
    serverSelect.onchange = () => {
        updatePlayerSource(serverSelect.value);
    };
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ========== TAB SWITCHING (deve estar aqui para elementos existirem) ==========
    function switchTab(tabName) {
        currentTab = tabName;

        // Oculta todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Mostra a aba selecionada
        const tabElement = document.getElementById(`${tabName}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        // Atualiza botões de navegação
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        console.log(`Switched to tab: ${tabName}`);
    }

    // Event listeners para botões de abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // ========== CARREGAMENTO DAS CATEGORIAS ==========

async function fetchAndRenderMovies(endpoint, containerId, mediaType = 'movie') {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro backend: ${response.status}`);
        }

        const data = await response.json();
        const container = document.getElementById(containerId);

        container.innerHTML = '';

        data.results.forEach(item => {
            const posterPath = item.poster_path || item.backdrop_path;
            if (posterPath) {
                const poster = document.createElement('img');
                poster.src = `${IMG_BASE_URL}${posterPath}`;
                poster.alt = item.title || item.name || 'Título';
                poster.title = item.title || item.name || '';
                poster.loading = 'lazy';
                poster.onclick = () => openModal(item, mediaType);
                container.appendChild(poster);
            }
        });

        console.log(`Carregados ${data.results.length} itens em ${containerId}`);
    } catch (error) {
        console.error('Erro ao carregar:', error);
        const container = document.getElementById(containerId);
        container.innerHTML = '<p style="color: red;">Erro ao carregar. Verifique o backend.</p>';
    }
}

function renderMoviesArray(movies, containerId, mediaType = 'movie') {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!movies || movies.length === 0) return;

    movies.forEach(movie => {
        const posterPath = movie.poster_path || movie.backdrop_path;
        if (posterPath) {
            const poster = document.createElement('img');
            poster.src = `${IMG_BASE_URL}${posterPath}`;
            poster.alt = movie.title || movie.name || 'Título';
            poster.title = movie.title || movie.name || '';
            poster.loading = 'lazy';
            poster.onclick = () => openModal(movie, mediaType);
            container.appendChild(poster);
        }
    });
}

// ============================================================================
// BUSCA - Filmes & Séries
// ============================================================================

async function fetchSuggestions(query) {
    try {
        if (!query || query.trim().length < 1) return [];
        const url = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            console.warn('Erro na busca de sugestões:', resp.status);
            return [];
        }
        const data = await resp.json();
        const results = (data.results || []).slice(0, 6);
        console.log(`Sugestões encontradas: ${results.length}`);
        return results;
    } catch (e) {
        console.error('Erro ao buscar sugestões:', e);
        return [];
    }
}

function showSuggestions(items, suggestionsBoxId) {
    const box = document.getElementById(suggestionsBoxId);
    if (!box) {
        console.warn(`Container de sugestões não encontrado: ${suggestionsBoxId}`);
        return;
    }
    
    box.innerHTML = '';
    
    if (!items || items.length === 0) {
        box.style.display = 'none';
        box.setAttribute('aria-hidden', 'true');
        return;
    }
    
    items.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item';
        
        const title = document.createElement('div');
        title.className = 'search-suggestion-title';
        title.textContent = movie.title || movie.name || 'Título';
        
        const sub = document.createElement('div');
        sub.className = 'search-suggestion-sub';
        sub.textContent = movie.release_date ? movie.release_date.substring(0, 4) : movie.first_air_date ? movie.first_air_date.substring(0, 4) : '';
        
        item.appendChild(title);
        if (sub.textContent) item.appendChild(sub);
        
        item.onclick = () => {
            const q = movie.title || movie.name || '';
            showSuggestions([], suggestionsBoxId);
            window.location.href = `/1-pages/search-results.html?query=${encodeURIComponent(q)}`;
        };
        
        box.appendChild(item);
    });
    
    box.style.display = 'block';
    box.setAttribute('aria-hidden', 'false');
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

    // Carrega categorias de filmes
    fetchAndRenderMovies('/popular', 'popular-movies', 'movie');
    fetchAndRenderMovies('/action', 'action-movies', 'movie');
    fetchAndRenderMovies('/comedy', 'comedy-movies', 'movie');

    // Carrega categorias de séries
    fetchAndRenderMovies('/tv/popular', 'tv-popular-movies', 'tv');
    fetchAndRenderMovies('/tv/action', 'tv-action-movies', 'tv');
    fetchAndRenderMovies('/tv/comedy', 'tv-comedy-movies', 'tv');

    // ========== SETUP GENÉRICO DE BUSCA ==========
    // Função para setup de qualquer campo de busca
    function setupSearchHandlers(inputId, suggestionsBoxId, btnId) {
        const searchInput = document.getElementById(inputId);
        const searchBtn = document.getElementById(btnId);
        const suggestionsBox = document.getElementById(suggestionsBoxId);
        let blurTimeout = null;

        if (!searchInput || !searchBtn || !suggestionsBox) {
            console.warn(`Missing elements for search: ${inputId}, ${btnId}, or ${suggestionsBoxId}`);
            return;
        }

        searchBtn.onclick = () => {
            const q = searchInput.value.trim();
            if (!q) return;
            window.location.href = `/1-pages/search-results.html?query=${encodeURIComponent(q)}`;
        };

        searchInput.addEventListener('input', (e) => {
            const q = e.target.value;
            if (searchTimeout) clearTimeout(searchTimeout);
            if (suggestionTimeout) clearTimeout(suggestionTimeout);

            if (!q || q.length < 2) {
                showSuggestions([], suggestionsBoxId);
                return;
            }

            // Fetch suggestions com delay de 300ms
            suggestionTimeout = setTimeout(async () => {
                const sug = await fetchSuggestions(q);
                showSuggestions(sug, suggestionsBoxId);
            }, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = searchInput.value.trim();
                if (!q) return;
                window.location.href = `/1-pages/search-results.html?query=${encodeURIComponent(q)}`;
            }
        });

        // Focus: reapririr sugestões se houver texto
        searchInput.addEventListener('focus', () => {
            if (blurTimeout) clearTimeout(blurTimeout);
            const q = searchInput.value.trim();
            if (q && q.length >= 2) {
                showSuggestions([], suggestionsBoxId); // Limpar primeiro
                // Refetch après refocus
                suggestionTimeout = setTimeout(async () => {
                    const sug = await fetchSuggestions(q);
                    showSuggestions(sug, suggestionsBoxId);
                }, 300);
            }
        });

        // Blur: fechar sugestões após sair do campo
        searchInput.addEventListener('blur', () => {
            blurTimeout = setTimeout(() => {
                showSuggestions([], suggestionsBoxId);
            }, 250);
        });

        // Mousedown no dropdown: evitar que blur feche
        suggestionsBox.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (blurTimeout) clearTimeout(blurTimeout);
        });
    }

    // Setup para FILMES
    setupSearchHandlers('search-input', 'search-suggestions', 'search-btn');

    // Setup para SÉRIES
    setupSearchHandlers('search-input-series', 'search-suggestions-series', 'search-btn-series');

    console.log('7-home.js initialized');
});
