// Configuração de API
const API_BASE_URL = 'http://localhost:8080/api';
const API_TIMEOUT = 5000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

class ApiService {
  constructor() {
    this.isBackendAvailable = false;
    this.retryCount = 0;
    this.checkBackendAvailability();
  }

  /**
   * Verifica se o backend está disponível
   */
  async checkBackendAvailability() {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/popular`, {
        method: 'GET',
        timeout: API_TIMEOUT,
      });
      
      if (response.ok) {
        this.isBackendAvailable = true;
        this.retryCount = 0;
        console.log('✅ Backend conectado com sucesso');
        this.notifyBackendStatus(true);
        return true;
      }
    } catch (error) {
      this.isBackendAvailable = false;
      this.handleBackendUnavailable();
    }
    
    return false;
  }

  /**
   * Busca filmes populares
   */
  async getPopularMovies() {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) {
        console.error('⚠️ Backend não está disponível');
        return [];
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/popular`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar filmes populares:', error);
      this.handleBackendUnavailable();
      return [];
    }
  }

  /**
   * Busca filmes por gênero
   */
  async getMoviesByGenre(genreId) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/genre/${genreId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar filmes do gênero ${genreId}:`, error);
      this.handleBackendUnavailable();
      return [];
    }
  }

  /**
   * Busca detalhes de um filme
   */
  async getMovieDetails(movieId) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do filme ${movieId}:`, error);
      this.handleBackendUnavailable();
      return null;
    }
  }

  /**
   * Busca filmes favoritos do usuário
   */
  async getFavoriteMovies(userId) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return [];
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar filmes favoritos:', error);
      return [];
    }
  }

  /**
   * Adiciona filme aos favoritos
   */
  async addFavorite(userId, movieId) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return false;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId }),
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return false;
    }
  }

  /**
   * Remove filme dos favoritos
   */
  async removeFavorite(userId, movieId) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return false;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return false;
    }
  }

  /**
   * Busca vídeos de um filme
   */
  async getMovieVideos(movieId) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}/videos`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar vídeos do filme ${movieId}:`, error);
      return [];
    }
  }

  /**
   * Busca sugestões de filmes
   */
  async searchMovies(query) {
    if (!this.isBackendAvailable) {
      await this.checkBackendAvailability();
      if (!this.isBackendAvailable) return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      return [];
    }
  }

  /**
   * Trata quando o backend não está disponível
   */
  handleBackendUnavailable() {
    this.isBackendAvailable = false;
    this.notifyBackendStatus(false);
    
    // Tenta reconectar após alguns segundos
    if (this.retryCount < RETRY_ATTEMPTS) {
      this.retryCount++;
      console.warn(`⚠️ Backend indisponível. Tentativa ${this.retryCount}/${RETRY_ATTEMPTS}`);
      setTimeout(() => {
        this.checkBackendAvailability();
      }, RETRY_DELAY);
    } else {
      console.error('❌ Backend está indisponível após múltiplas tentativas');
    }
  }

  /**
   * Notifica sobre o status do backend
   */
  notifyBackendStatus(isAvailable) {
    const event = new CustomEvent('backendStatusChanged', {
      detail: { isAvailable },
    });
    document.dispatchEvent(event);
  }

  /**
   * Ativa o monitoramento contínuo do backend
   */
  startBackendMonitoring(interval = 30000) {
    setInterval(() => {
      this.checkBackendAvailability();
    }, interval);
  }
}

// Exportar instância única da API
const apiService = new ApiService();

// Iniciar monitoramento a cada 30 segundos
apiService.startBackendMonitoring();
