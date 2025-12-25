const express = require('express');
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
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal server error' });
});


module.exports = app;
