import { defineConfig } from 'vite';

/**
 * Vite Configuration para Sensplay
 * - Hot reload automático para HTML/CSS/JS
 * - Proxy automático: /api -> http://localhost:8080
 * - Dev server em http://localhost:5173 (padrão) ou customize abaixo
 */
export default defineConfig({
  root: './1-pages',  // Serve from current directory (1-frontend)
  server: {
    port: 3000,
    strictPort: false,  // Se a porta estiver ocupada, usa outra
    proxy: {
      // Proxy automático: qualquer request /api/* vai para http://localhost:8080
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,  // Muda o header Origin para target
        rewrite: (path) => path,  // Mantém o path como é (/api/movies/popular -> /api/movies/popular)
      }
    },
    // CORS não precisa ser configurado aqui com proxy, mas pode adicionar se necessário
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    fs: {
      strict: false,  // Allow serving files outside root
      allow: ['../../', './1-pages', './3-Css', './2-assets', './4-js'],
    },
    historyApiFallback: true  // Redireciona todas as rotas para index.html
  },

  preview: {
    port: 5173,
    strictPort: false,
  },

  // Otimizações de build (production)
  build: {
    outDir: '../dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './1-pages/index.html',
        login: './1-pages/2-login.html',
        register: './1-pages/3-register.html',
        dashboard: './1-pages/4-dashboard.html',
        filmes: './1-pages/5-filmes.html',
        home: './1-pages/7-home.html',
        searchResults: './1-pages/search-results.html'
      }
    }
  }
});
