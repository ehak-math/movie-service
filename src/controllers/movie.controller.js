const Movie = require('../models/Movie');

async function createMovie(req, res, next) {
  try {
    const { title, description, durationMinutes, posterUrl } = req.body;
    const movie = await Movie.create({ title, description, durationMinutes, posterUrl });
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
}

async function listMovies(req, res, next) {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    next(err);
  }
}

async function getMovie(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'movie not found' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
}

module.exports = { createMovie, listMovies, getMovie };
