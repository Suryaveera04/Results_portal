require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectRedis } = require('./config/database');
const queueManager = require('./services/queueManager');
const sessionController = require('./services/sessionController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/queue', require('./routes/queue'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/result', require('./routes/result'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

setInterval(() => {
  queueManager.processQueue(io);
  sessionController.cleanupExpiredSessions();
}, 5000);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
