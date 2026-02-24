require('dotenv').config();
const { redisClient, connectRedis } = require('./config/database');

async function clearRedis() {
  await connectRedis();
  await redisClient.flushDb();
  console.log('✅ Redis cleared!');
  process.exit(0);
}

clearRedis();
