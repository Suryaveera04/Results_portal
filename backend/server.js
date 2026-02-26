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

// CORS origins from environment or defaults
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

console.log('CORS Origins:', corsOrigins);

const io = new Server(server, { 
  cors: { 
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  } 
});

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

app.use('/api/queue', require('./routes/queue'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/result', require('./routes/result'));
app.use('/api/result-links', require('./routes/resultLinks'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

setInterval(() => {
  queueManager.processQueue(io);
  sessionController.cleanupExpiredSessions();
}, 3000);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
