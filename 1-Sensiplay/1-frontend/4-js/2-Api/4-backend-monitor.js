// Monitor de disponibilidade do Backend
class BackendMonitor {
  constructor() {
    this.isOnline = true;
    this.setupListeners();
    this.checkBackendStatus();
  }

  setupListeners() {
    // Ouve mudanças no status do backend
    document.addEventListener('backendStatusChanged', (event) => {
      const { isAvailable } = event.detail;
      this.isOnline = isAvailable;
      
      if (isAvailable) {
        this.showSuccessMessage();
        this.hideErrorBanner();
      } else {
        this.showErrorBanner();
      }
    });
  }

  async checkBackendStatus() {
    try {
      const response = await fetch('/api/movies/popular', {
        method: 'HEAD',
        timeout: 3000,
      });
      
      if (!response.ok) {
        this.showErrorBanner();
      }
    } catch (error) {
      this.showErrorBanner();
    }
  }

  showErrorBanner() {
    let banner = document.getElementById('backend-error-banner');
    
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'backend-error-banner';
      banner.className = 'backend-error-banner';
      banner.innerHTML = `
        <div class="backend-error-content">
          <span class="backend-error-icon">⚠️</span>
          <span class="backend-error-text">
            Backend indisponível. Tentando reconectar...
          </span>
          <button class="backend-retry-btn" onclick="backendMonitor.retryConnection()">
            Tentar Novamente
          </button>
        </div>
      `;
      document.body.insertBefore(banner, document.body.firstChild);
    }
    
    banner.style.display = 'block';
  }

  hideErrorBanner() {
    const banner = document.getElementById('backend-error-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  showSuccessMessage() {
    const banner = document.getElementById('backend-error-banner');
    if (banner && banner.style.display !== 'none') {
      const content = banner.querySelector('.backend-error-content');
      if (content) {
        content.innerHTML = `
          <span class="backend-success-icon">✅</span>
          <span class="backend-success-text">Backend reconectado!</span>
        `;
        setTimeout(() => {
          this.hideErrorBanner();
        }, 3000);
      }
    }
  }

  retryConnection() {
    console.log('Tentando reconectar ao backend...');
    apiService.checkBackendAvailability();
  }
}

// Criar instância do monitor
const backendMonitor = new BackendMonitor();

// Estilos CSS para o banner (adicionado dinamicamente)
const style = document.createElement('style');
style.textContent = `
  .backend-error-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
    color: white;
    padding: 12px 20px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .backend-error-content {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .backend-error-icon {
    font-size: 18px;
  }

  .backend-success-icon {
    font-size: 18px;
  }

  .backend-error-text,
  .backend-success-text {
    flex: 1;
    font-weight: 500;
  }

  .backend-retry-btn {
    background: white;
    color: #ff6b6b;
    border: none;
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
  }

  .backend-retry-btn:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.02);
  }

  .backend-retry-btn:active {
    transform: scale(0.98);
  }
`;

document.head.appendChild(style);
