import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'next/navigation': 'next/navigation.js',
      // Force ROOT versions for both to ensure they match (since react-dom seems to stick to root)
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom/client': path.resolve(__dirname, '../../node_modules/react-dom/client.js'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
    deps: {
      optimizer: {
        web: {
          include: ['react', 'react-dom'],
        },
      },
    },
  },
})
