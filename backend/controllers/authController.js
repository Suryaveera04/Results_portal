const authService = require('../services/authService');
const queueManager = require('../services/queueManager');
const sessionController = require('../services/sessionController');

exports.login = async (req, res) => {
  try {
    const { rollNo, dob, queueToken, department, resultConfig } = req.body;
    
    console.log('=== Login Request ===');
    console.log('rollNo:', rollNo);
    console.log('department:', department);
    console.log('queueToken:', queueToken);
    console.log('queueToken type:', typeof queueToken);
    console.log('queueToken length:', queueToken?.length);
    console.log('resultConfig:', JSON.stringify(resultConfig, null, 2));

    if (!queueToken) {
      console.error('ERROR: No queue token provided');
      return res.status(400).json({ error: 'Queue token is required' });
    }

    console.log('Validating queue token...');
    const tokenData = await queueManager.validateToken(queueToken);
    console.log('Token validation result:', tokenData);
    
    if (!tokenData) {
      console.error('ERROR: Token not found in Redis');
      return res.status(403).json({ error: 'Queue token not found. Please rejoin the queue.' });
    }
    
    if (tokenData.status !== 'ACTIVE') {
      console.error('ERROR: Token status is not ACTIVE, current status:', tokenData.status);
      return res.status(403).json({ error: `Queue token is ${tokenData.status}. Please rejoin the queue.` });
    }
    
    console.log('Token is valid and ACTIVE');

    if (!rollNo || !dob || !department || !resultConfig) {
      console.error('ERROR: Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('Generating session token...');
    const sessionToken = authService.generateToken(rollNo, department, dob, resultConfig);
    
    console.log('Creating session...');
    await sessionController.createSession(rollNo, sessionToken);
    
    console.log('Consuming queue token...');
    await queueManager.consumeToken(queueToken);

    // Trigger immediate queue processing after login
    setImmediate(() => {
      const io = req.app.get('io');
      if (io) queueManager.processQueue(io);
    });

    console.log('Login successful for:', rollNo);
    res.json({ 
      token: sessionToken,
      student: { rollNo, department, dob, resultConfig }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await sessionController.endSession(req.sessionToken, req.rollNo);
    
    // Trigger immediate queue processing after logout
    setImmediate(() => {
      const io = req.app.get('io');
      if (io) queueManager.processQueue(io);
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
