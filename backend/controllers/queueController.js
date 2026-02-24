const queueManager = require('../services/queueManager');

exports.joinQueue = async (req, res) => {
  try {
    const token = await queueManager.addToQueue();
    const position = await queueManager.getQueuePosition(token);
    const queueLength = await queueManager.getQueueLength();
    
    const avgProcessTime = parseInt(process.env.SESSION_DURATION) + parseInt(process.env.LOGIN_WINDOW);
    const slotsAvailable = parseInt(process.env.CONCURRENT_SLOTS);
    const estimatedSeconds = Math.ceil((position / slotsAvailable) * avgProcessTime);
    
    res.json({ 
      token, 
      position,
      queueLength,
      estimatedWait: estimatedSeconds,
      joinedAt: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenData = await queueManager.validateToken(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    const position = await queueManager.getQueuePosition(token);
    const queueLength = await queueManager.getQueueLength();
    
    const avgProcessTime = parseInt(process.env.SESSION_DURATION) + parseInt(process.env.LOGIN_WINDOW);
    const slotsAvailable = parseInt(process.env.CONCURRENT_SLOTS);
    const estimatedSeconds = position ? Math.ceil((position / slotsAvailable) * avgProcessTime) : 0;
    
    console.log(`[Status] Token: ${token.substring(0, 8)}..., Status: ${tokenData.status}, Position: ${position}`);
    
    res.json({
      status: tokenData.status,
      position: position || 0,
      queueLength,
      estimatedWait: estimatedSeconds,
      joinedAt: tokenData.joinedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.leaveQueue = async (req, res) => {
  try {
    const { token } = req.params;
    await queueManager.removeFromQueue(token);
    res.json({ message: 'Removed from queue' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
