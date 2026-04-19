const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const storePath = path.join(__dirname, 'store.json');
const JWT_SECRET = process.env.JWT_SECRET || 'bilge-secret';

async function ensureDataFiles() {
  try {
    await fs.access(storePath);
  } catch (error) {
    await writeStore({ users: [], sessions: [] });
  }

  const store = await readStore();
  if (!Array.isArray(store.users) || !Array.isArray(store.sessions)) {
    await writeStore({ users: [], sessions: [] });
    return;
  }

  if (store.users.length === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const admin = {
      id: uuidv4(),
      name: 'Admin User',
      username: 'admin',
      email: 'admin@bilge.app',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    store.users.push(admin);
    await writeStore(store);
  }
}

async function readStore() {
  const raw = await fs.readFile(storePath, 'utf8');
  return JSON.parse(raw);
}

async function writeStore(data) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), 'utf8');
}

async function findUserByUsername(username) {
  const store = await readStore();
  return store.users.find((user) => user.username === username);
}

async function findUserByEmail(email) {
  const store = await readStore();
  return store.users.find((user) => user.email === email);
}

async function createUser(userData) {
  const store = await readStore();
  const user = {
    id: uuidv4(),
    name: userData.name,
    username: userData.username,
    email: userData.email,
    passwordHash: userData.passwordHash,
    role: userData.role || 'user',
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  await writeStore(store);
  return user;
}

async function saveSession(token, userId) {
  const store = await readStore();
  store.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  await writeStore(store);
}

async function removeSession(token) {
  const store = await readStore();
  store.sessions = store.sessions.filter((session) => session.token !== token);
  await writeStore(store);
}

async function isTokenActive(token) {
  const store = await readStore();
  return store.sessions.some((session) => session.token === token);
}

async function getSessionUser(token) {
  const store = await readStore();
  const session = store.sessions.find((sessionItem) => sessionItem.token === token);
  if (!session) return null;
  return store.users.find((user) => user.id === session.userId) || null;
}

module.exports = {
  ensureDataFiles,
  findUserByUsername,
  findUserByEmail,
  createUser,
  saveSession,
  removeSession,
  isTokenActive,
  getSessionUser,
};
