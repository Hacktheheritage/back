const jwt = require('jsonwebtoken');
const { isTokenActive, getSessionUser } = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'bilge-secret';

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authorization.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (!(await isTokenActive(token))) {
    return res.status(401).json({ error: 'Token has been logged out or invalidated' });
  }

  const user = await getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Authenticated user not found' });
  }

  req.user = user;
  req.token = token;
  next();
}

module.exports = { authMiddleware };
