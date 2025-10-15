// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../model/user');

module.exports = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.split(' ')[1] || req.query.token;
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const user = await User.findById(decoded.userId || decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'Invalid user' });

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.user = user; // attach user to request
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};
