const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  findUserByEmail,
  findUserByUsername,
  createUser,
  saveSession,
  removeSession,
  getSessionUser,
} = require('../data/store');
const { validateLogin, validateRegister } = require('../utils/validators');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bilge-secret';
const TOKEN_EXPIRATION = '8h';

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  };
}

router.post('/login', async (req, res) => {
  const { payload, errors } = validateLogin(req.body);
  if (!payload) {
    return res.status(400).json({ errors });
  }

  const user = await findUserByUsername(payload.username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const passwordMatches = bcrypt.compareSync(payload.password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin credentials required' });
  }

  const token = createToken({ userId: user.id });
  await saveSession(token, user.id);

  res.json({ token, user: publicUser(user) });
});

router.post('/register', async (req, res) => {
  const { payload, errors } = validateRegister(req.body);
  if (!payload) {
    return res.status(400).json({ errors });
  }

  if (await findUserByEmail(payload.email)) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  if (await findUserByUsername(payload.username)) {
    return res.status(409).json({ error: 'Username is already taken' });
  }

  const passwordHash = bcrypt.hashSync(payload.password, 10);
  const user = await createUser({
    name: payload.name,
    email: payload.email,
    username: payload.username,
    passwordHash,
    role: 'user',
  });

  const token = createToken({ userId: user.id });
  await saveSession(token, user.id);

  res.status(201).json({ token, user: publicUser(user) });
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/logout', authMiddleware, async (req, res) => {
  await removeSession(req.token);
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
