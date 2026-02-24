const jwt = require('jsonwebtoken');

class AuthService {
  generateToken(rollNo, department, dob, resultConfig) {
    return jwt.sign(
      { rollNo, department, dob, resultConfig }, 
      process.env.JWT_SECRET, 
      { expiresIn: `${process.env.SESSION_DURATION}s` }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService();
