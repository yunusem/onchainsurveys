const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('auth middleware, Received token:', token);
  try {
    const decoded = jwt.verify(token, secret);
    console.log('auth middleware, Decoded token:', decoded);
    req.user = { _id: decoded.userId };
    console.log('auth middleware, User object set:', req.user);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
