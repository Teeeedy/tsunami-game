const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { registerHandlers } = require('./sockets');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        methods: ['GET', 'POST'],
    },
});

// Serve the React build in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// API health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — serve index.html for all non-API, non-static routes
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Register WebSocket handlers
registerHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🌊 TSUNAMI server running on port ${PORT}`);
});
