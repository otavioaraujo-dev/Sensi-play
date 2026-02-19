// 5-filmes.js - MVP Netflix-like com TMDB via backend proxy (seguro)
// Miguel - Fevereiro 2026

// === CONFIGURAÇÕES ===
// 🔧 DEVELOPMENT: Frontend (Live Server 5500) + Backend (8080) separados
// API base: usa proxy quando rodando no Vite (porta 3000/5173), senão usa backend direto
const _origin = window.location.origin || '';
const API_BASE_URL = (_origin.includes(':3000') || _origin.includes(':5173')) ? '/api/movies' : 'http://localhost:8080/api/movies';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Posters TMDB

// Elementos do DOM
const modal = document.getElementById('movie-modal');
const closeBtn = document.querySelector('.close');
const modalTitle = document.getElementById('modal-title');
const modalOverview = document.getElementById('modal-overview');
const player = document.getElementById('movie-player');
const serverSelect = document.getElementById('server-select');

let currentMovieId = null;
let searchTimeout = null;
let suggestionTimeout = null;

// Função auxiliar: Fetch do backend e renderiza posters
async function fetchAndRenderMovies(endpoint, containerId, mediaType = 'movie') {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro backend: ${response.status}`);
        }
        
        const data = await response.json();
        const container = document.getElementById(containerId);
        
        container.innerHTML = '';  // Limpa antes
        
        data.results.forEach(item => {
            // TMDB: movies have 'title', tv have 'name'
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
        
        console.log(`Carregados ${data.results.length} filmes em ${containerId}`);
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        const container = document.getElementById(containerId);
        container.innerHTML = '<p style="color: red;">Erro ao carregar. Verifique o backend.</p>';
    }
}

// Reutilizável: renderiza um array de filmes em um container (limpa antes)
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

// Busca (endpoint /api/movies/search?query=...)
async function fetchSearch(query) {
    try {
        const section = document.getElementById('search-results-section');
        const emptyMsg = document.getElementById('search-empty-message');

        if (!query || query.trim().length < 1) {
            section.style.display = 'none';
            emptyMsg.style.display = 'none';
            document.getElementById('search-results').innerHTML = '';
            return;
        }

        const url = `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Erro backend: ${resp.status}`);
        }

        const data = await resp.json();
        const results = data.results || [];

        if (results.length === 0) {
            section.style.display = 'block';
            document.getElementById('search-results').innerHTML = '';
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
            section.style.display = 'block';
            renderMoviesArray(results, 'search-results');
        }
    } catch (error) {
        console.error('Erro na busca:', error);
        const section = document.getElementById('search-results-section');
        const emptyMsg = document.getElementById('search-empty-message');
        section.style.display = 'block';
        emptyMsg.style.display = 'block';
        emptyMsg.textContent = 'Erro ao buscar. Tente novamente.';
    }
}

// Fetch suggestions (top 6 results) for autocomplete
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

function showSuggestions(items) {
    const box = document.getElementById('search-suggestions');
    if (!box) {
        console.warn('Container de sugestões não encontrado');
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
            showSuggestions([]);
            // Redirect to search results page for consistent UX
            window.location.href = `/1-pages/search-results.html?query=${encodeURIComponent(q)}`;
        };
        
        box.appendChild(item);
    });
    
    box.style.display = 'block';
    box.setAttribute('aria-hidden', 'false');
}

// Abre modal
function openModal(item, mediaType = 'movie') {
    currentMovieId = item.id;
    const title = item.title || item.name || 'Título indisponível';
    modalTitle.textContent = title;
    modalOverview.textContent = item.overview || item.overview || 'Sinopse não disponível.';

    // If TV, set modal to TV mode (could show season/episode selectors later)
    modal.setAttribute('data-media-type', mediaType);
    updatePlayerSource(serverSelect.value);
    modal.style.display = 'flex';
}

// Atualiza player
function updatePlayerSource(server) {
    if (!currentMovieId) return;
    const mediaType = modal.getAttribute('data-media-type') || 'movie';
    let embedUrl;
    if (mediaType === 'tv') {
        // default to season 1 episode 1
        embedUrl = `https://player.autoembed.cc/embed/tv/${currentMovieId}/1/1?server=${server}`;
    } else {
        embedUrl = `https://player.autoembed.cc/embed/movie/${currentMovieId}?server=${server}`;
    }
    player.src = embedUrl;
    console.log('Player:', embedUrl);
}

// Eventos modal
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

// Carrega categorias
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderMovies('/popular', 'popular-movies');
    fetchAndRenderMovies('/action', 'action-movies');
    fetchAndRenderMovies('/comedy', 'comedy-movies');
    // load TV categories
    fetchAndRenderMovies('/tv/popular', 'tv-popular-movies', 'tv');
    fetchAndRenderMovies('/tv/action', 'tv-action-movies', 'tv');
    fetchAndRenderMovies('/tv/comedy', 'tv-comedy-movies', 'tv');

    // Search handlers
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const suggestionsBox = document.getElementById('search-suggestions');
    let blurTimeout = null;

    if (searchBtn && searchInput) {
        searchBtn.onclick = () => {
            const q = searchInput.value.trim();
            if (!q) return;
            // Redirect to dedicated results page
            window.location.href = `/1-pages/search-results.html?query=${encodeURIComponent(q)}`;
        };

        // Debounce: busca automática ao digitar (500ms) a partir de 3 caracteres
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value;
            if (searchTimeout) clearTimeout(searchTimeout);
            if (suggestionTimeout) clearTimeout(suggestionTimeout);
            // hide suggestions and results for short inputs
            if (!q || q.length < 2) {
                showSuggestions([]);
                document.getElementById('search-results-section').style.display = 'none';
                document.getElementById('search-empty-message').style.display = 'none';
                return;
            }

            // fetch suggestions quickly (debounce 300ms)
            suggestionTimeout = setTimeout(async () => {
                const sug = await fetchSuggestions(q);
                showSuggestions(sug);
            }, 300);

            // full search debounce (500ms) - update in-page results (user still on same page)
            searchTimeout = setTimeout(() => {
                fetchSearch(q);
            }, 500);
        });

        // Enter para buscar
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = searchInput.value.trim();
                if (!q) return;
                // Redirect on Enter as well
                window.location.href = `/1-pages/search-results.html?query=${encodeURIComponent(q)}`;
            }
        });

        // Focus: reabrir sugestões se houver texto
        searchInput.addEventListener('focus', () => {
            if (blurTimeout) clearTimeout(blurTimeout);
            const q = searchInput.value.trim();
            if (q && q.length >= 2) {
                showSuggestions([]); // Limpa antes
                // Refetch sugestões ao voltar o foco
                suggestionTimeout = setTimeout(async () => {
                    const sug = await fetchSuggestions(q);
                    showSuggestions(sug);
                }, 300);
            }
        });

        // Blur: fechar sugestões ao sair do campo
        searchInput.addEventListener('blur', () => {
            blurTimeout = setTimeout(() => {
                showSuggestions([]);
            }, 250);
        });

        // Mousedown nas sugestões: evitar que blur feche
        if (suggestionsBox) {
            suggestionsBox.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (blurTimeout) clearTimeout(blurTimeout);
            });
        }
    }
});