const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fixed: Use userId instead of UserId for consistency
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;