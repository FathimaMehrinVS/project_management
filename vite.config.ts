import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mockApiMiddleware } from './mock-api-middleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'mock-api-plugin',
      configureServer(server) {
        server.middlewares.use(mockApiMiddleware());
      }
    }
  ],
})
