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

app.get('/', (req, res) => {
  res.json({ message: 'Bilge backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bilge backend is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

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
