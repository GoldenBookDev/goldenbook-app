const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const target = 'http://localhost:8081'; // Puerto donde corre Metro

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    methods: 'GET, POST, PUT, DELETE, OPTIONS'
}));

app.use(
    '/',
    createProxyMiddleware({
        target,
        changeOrigin: true,
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            proxyReq.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        },
    })
);

app.listen(3000, () => {
    console.log('Proxy server is running on http://localhost:3000');
    exec('expo start --dev-client'); // Inicia Expo en el puerto 8081
});
