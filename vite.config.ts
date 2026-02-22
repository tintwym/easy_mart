import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias:
            process.env.BUILD_PWA === '1'
                ? []
                : [
                      {
                          find: 'virtual:pwa-register',
                          replacement: path.resolve(__dirname, 'resources/js/pwa-register-stub.ts'),
                      },
                  ],
    },
    plugins: [
        laravel({
            // CSS is imported in app.tsx; avoid separate entry to prevent "preloaded but not used" warning
            input: ['resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        // PWA disabled in production build until vite-plugin-pwa + workbox terser race is resolved.
        // Set BUILD_PWA=1 to enable (e.g. BUILD_PWA=1 npm run build).
        ...(process.env.BUILD_PWA === '1'
            ? [
                  VitePWA({
                      registerType: 'autoUpdate',
                      includeAssets: ['easymart-logo.png', 'favicon.ico'],
                      manifest: false,
                      workbox: {
                          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                          sourcemap: false,
                      },
                      devOptions: { enabled: false },
                  }),
              ]
            : []),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
