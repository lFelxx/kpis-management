import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    }
  },
  build: {
    // Subimos un poco el límite de aviso por tamaño de chunk
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core de React
          react: ['react', 'react-dom'],
          // Estado y routing
          vendor: ['react-router-dom', 'zustand'],
          // Librerías de gráficos
          charts: ['chart.js', 'react-chartjs-2'],
          // Efectos de partículas pesados
          tsparticles: ['@tsparticles/react', '@tsparticles/engine', '@tsparticles/slim'],
        },
      },
    },
  },
})
