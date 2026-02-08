import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
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
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['easymart-logo.png', 'favicon.ico'],
            manifest: false,
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                sourcemap: false,
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
