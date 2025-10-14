import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), viteSingleFile()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../'),
      },
    },
    // Proxy API requests to ServiceNow instance in development
    server: {
      proxy: mode === 'development' && env.VITE_SERVICENOW_INSTANCE
        ? {
            '/api': {
              target: env.VITE_SERVICENOW_INSTANCE,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  build: {
    outDir: 'dist',
    // Inline all assets into single HTML file for ServiceNow
    assetsInlineLimit: 100000000, // Inline everything
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    // Increase chunk size warning limit for large bundle
    chunkSizeWarningLimit: 2000,
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
    // Configure for production build
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  };
});
