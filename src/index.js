require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { ensureDataFiles } = require('./data/store');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());

// Serve static files from the frontend build directory
const distPath = process.env.VERCEL ? path.join(__dirname, '../dist') : path.join(__dirname, '../../front/dist');
app.use(express.static(distPath));

app.get('/', (req, res) => {
  res.json({ message: 'Bilge backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bilge backend is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = process.env.VERCEL ? path.join(__dirname, '../dist/index.html') : path.join(__dirname, '../../front/dist/index.html');
  res.sendFile(indexPath);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

ensureDataFiles()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Bilge backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize backend:', error);
    process.exit(1);
  });

