require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const movieRoutes = require('./routes/movie.routes');
const showtimeRoutes = require('./routes/showtime.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/movies', movieRoutes);
app.use('/showtimes', showtimeRoutes);

app.get('/', (req, res) => res.json({ service: 'movie-service', status: 'ok' }));

// simple error handler
app.use((err, req, res) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal server error' });
});

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/moviedb';
const PORT = process.env.PORT || 4002;

mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to Movie DB');
    app.listen(PORT, () => console.log(`Movie service listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });

module.exports = app;
