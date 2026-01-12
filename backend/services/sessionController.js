const { redisClient } = require('../config/database');

const SESSION_PREFIX = 'result_session:';
const ACTIVE_SESSIONS_KEY = 'active_sessions';

class SessionController {
  async createSession(rollNo, token) {
    const existing = await redisClient.hGet(ACTIVE_SESSIONS_KEY, rollNo);
    if (existing) {
      throw new Error('Active session exists for this roll number');
    }

    const sessionData = {
      rollNo,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + (parseInt(process.env.SESSION_DURATION) * 1000)
    };

    await redisClient.setEx(`${SESSION_PREFIX}${token}`, parseInt(process.env.SESSION_DURATION), JSON.stringify(sessionData));
    await redisClient.hSet(ACTIVE_SESSIONS_KEY, rollNo, token);

    return sessionData;
  }

  async validateSession(token) {
    const data = await redisClient.get(`${SESSION_PREFIX}${token}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  async endSession(token, rollNo) {
    await redisClient.del(`${SESSION_PREFIX}${token}`);
    await redisClient.hDel(ACTIVE_SESSIONS_KEY, rollNo);
  }

  async cleanupExpiredSessions() {
    const sessions = await redisClient.hGetAll(ACTIVE_SESSIONS_KEY);
    for (const [rollNo, token] of Object.entries(sessions)) {
      const exists = await redisClient.exists(`${SESSION_PREFIX}${token}`);
      if (!exists) {
        await redisClient.hDel(ACTIVE_SESSIONS_KEY, rollNo);
      }
    }
  }
}

module.exports = new SessionController();
