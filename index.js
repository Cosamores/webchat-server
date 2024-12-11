const express = require('express');
const http = require('http');
// const { setupWebSocket } = require('./utils/websocket'); // Remove this line
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const cors = require('cors');
app.use(cors({ origin: '*' }));

const server = http.createServer(app);
// // Initialize WebSocket
// setupWebSocket(server); // Remove this line

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);
app.use('/users', userRoutes);

// **Update this line to align with frontend image URLs**
app.use('/uploads/messageMedia', express.static('public/uploads/messageMedia'));

// Start the server
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});