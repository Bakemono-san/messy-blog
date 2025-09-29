const express = require('express');
const postRoutes = require('./routes/postRoutes');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./lib/logger');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(rateLimiter);
app.use(requestLogger);

app.get('/', (req, res) => res.send('<h1>My Blog</h1>'));
app.use('/posts', postRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error: %o', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Blog app listening on port ${PORT}`);
});
