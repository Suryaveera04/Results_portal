const { redisClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const QUEUE_KEY = 'result_queue';
const ACTIVE_TOKENS_KEY = 'active_queue_tokens';
const TOKEN_PREFIX = 'queue_token:';

class QueueManager {
  async addToQueue() {
    const token = uuidv4();
    const queueData = {
      token,
      status: 'WAITING',
      joinedAt: Date.now()
    };
    
    await redisClient.rPush(QUEUE_KEY, JSON.stringify(queueData));
    await redisClient.setEx(`${TOKEN_PREFIX}${token}`, 1800, JSON.stringify(queueData)); // 30 minutes
    
    console.log('[Queue] Token created:', token, 'expires in 1800 seconds');
    return token;
  }

  async getQueuePosition(token) {
    const queueItems = await redisClient.lRange(QUEUE_KEY, 0, -1);
    const position = queueItems.findIndex(item => {
      const data = JSON.parse(item);
      return data.token === token;
    });
    
    return position === -1 ? null : position + 1;
  }

  async getQueueLength() {
    return await redisClient.lLen(QUEUE_KEY);
  }

  async getActiveCount() {
    return await redisClient.sCard(ACTIVE_TOKENS_KEY);
  }

  async processQueue(io) {
    try {
      const activeCount = await this.getActiveCount();
      const queueLength = await this.getQueueLength();
      const slots = parseInt(process.env.CONCURRENT_SLOTS) - activeCount;
      
      if (slots <= 0) return;

      for (let i = 0; i < slots; i++) {
        const item = await redisClient.lPop(QUEUE_KEY);
        if (!item) break;
        
        const queueData = JSON.parse(item);
        queueData.status = 'ACTIVE';
        queueData.activatedAt = Date.now();
        
        // Set token to expire after 30 minutes
        await redisClient.setEx(`${TOKEN_PREFIX}${queueData.token}`, 1800, JSON.stringify(queueData));
        await redisClient.sAdd(ACTIVE_TOKENS_KEY, queueData.token);
        
        console.log('[Queue] Token activated:', queueData.token, 'expires in 1800 seconds');
        io.emit('queue_ready', { token: queueData.token });
      }
    } catch (error) {
      console.error('[Queue] Process error:', error.message);
    }
  }

  async validateToken(token) {
    const data = await redisClient.get(`${TOKEN_PREFIX}${token}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  async consumeToken(token) {
    await redisClient.del(`${TOKEN_PREFIX}${token}`);
    await redisClient.sRem(ACTIVE_TOKENS_KEY, token);
  }

  async removeFromQueue(token) {
    const queueItems = await redisClient.lRange(QUEUE_KEY, 0, -1);
    for (const item of queueItems) {
      const data = JSON.parse(item);
      if (data.token === token) {
        await redisClient.lRem(QUEUE_KEY, 1, item);
        break;
      }
    }
    await redisClient.del(`${TOKEN_PREFIX}${token}`);
    await redisClient.sRem(ACTIVE_TOKENS_KEY, token);
  }
}

module.exports = new QueueManager();
