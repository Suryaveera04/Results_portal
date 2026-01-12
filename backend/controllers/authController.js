const authService = require('../services/authService');
const queueManager = require('../services/queueManager');
const sessionController = require('../services/sessionController');

exports.login = async (req, res) => {
  try {
    const { rollNo, dob, queueToken, department } = req.body;

    const tokenData = await queueManager.validateToken(queueToken);
    if (!tokenData || tokenData.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Invalid or expired queue token' });
    }

    if (!rollNo || !dob || !department) {
      throw new Error('All fields are required');
    }

    const sessionToken = authService.generateToken(rollNo, department, dob);
    
    await sessionController.createSession(rollNo, sessionToken);
    await queueManager.consumeToken(queueToken);

    res.json({ 
      token: sessionToken,
      student: { rollNo, department, dob }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await sessionController.endSession(req.sessionToken, req.rollNo);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
