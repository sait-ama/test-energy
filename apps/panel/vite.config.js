import dns from 'node:dns';

import react from '@vitejs/plugin-react-swc';
import fs from 'fs/promises';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
    plugins: [
        react(),
        eslint({
            exclude: [
                // Исключаем стандартные node_modules
                'node_modules/**',
                // Исключаем пакет @re/core в любом формате путей
                /[\\/]@re[\\/]core[\\/]/,
            ],
        }),
    ],
    define: {
        process: { argv: [], env: {} },
    },
    resolve: {
        alias: {
            src: '/src',
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('@material-ui')) {
                            return 'vendor_mui';
                        }
                        return 'vendor';
                    }
                },
            },
        },
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'load-js-files-as-jsx',
                    setup(build) {
                        build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => ({
                            loader: 'jsx',
                            contents: await fs.readFile(args.path, 'utf8'),
                        }));
                    },
                },
            ],
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'https://panel.remanga.org/',
                // target: 'https://test2.remanga.org/',
                // target: 'http://5.188.117.57:8990',
                changeOrigin: true,
                secure: false,
                ws: true,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
        cors: false,
    },
});
