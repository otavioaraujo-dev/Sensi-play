import { defineConfig } from 'vite';

/**
 * Vite Configuration para Sensplay
 * - Hot reload automático para HTML/CSS/JS
 * - Proxy automático: /api -> http://localhost:8080
 * - Dev server em http://localhost:5173 (padrão) ou customize abaixo
 */
export default defineConfig({
  root: './',  // Serve from current directory (1-frontend)
  server: {
    port: 3000,
    strictPort: false,  // Se a porta estiver ocupada, usa outra
    open: '/1-pages/7-home.html',  // Abre automaticamente ao rodar
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
    }
  },

  preview: {
    port: 5173,
    strictPort: false,
  },

  // Otimizações de build (production)
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
  }
});
