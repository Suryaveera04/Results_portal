const authService = require('../services/authService');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.rollNo = decoded.rollNo;
  req.department = decoded.department;
  req.dob = decoded.dob;
  req.sessionToken = token;
  next();
};

module.exports = authMiddleware;
