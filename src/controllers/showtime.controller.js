const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

/**
 * Create a showtime
 * body: { movieId, startTime, auditorium, availableSeats: ["A1","A2", ...] }
 */
async function createShowtime(req, res, next) {
  try {
    const { movieId, startTime, auditorium, availableSeats } = req.body;
    // basic validation
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(400).json({ error: 'invalid movieId' });

    const s = await Showtime.create({ movieId, startTime, auditorium, availableSeats });
    res.status(201).json(s);
  } catch (err) {
    next(err);
  }
}

/**
 * Get showtime with populated movie and seat info
 */
async function getShowtime(req, res, next) {
  try {
    const s = await Showtime.findById(req.params.id).populate('movieId');
    if (!s) return res.status(404).json({ error: 'showtime not found' });
    res.json(s);
  } catch (err) {
    next(err);
  }
}

/**
 * Lock seats atomically:
 * body: { seats: ["A1","A2"] }
 * Condition: availableSeats contains ALL seats
 * Update: pull from availableSeats, add to reservedSeats
 */
async function lockSeats(req, res, next) {
  try {
    const { seats } = req.body;
    if (!Array.isArray(seats) || seats.length === 0) return res.status(400).json({ error: 'seats required' });

    const query = { _id: req.params.id, availableSeats: { $all: seats } };
    const update = {
      $pullAll: { availableSeats: seats },
      $addToSet: { reservedSeats: { $each: seats } }
    };

    const updated = await Showtime.findOneAndUpdate(query, update, { new: true });
    if (!updated) {
      return res.status(409).json({ error: 'some seats unavailable' });
    }
    return res.json({ success: true, showtime: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Confirm seats: move from reservedSeats -> bookedSeats (requires reserved)
 */
async function confirmSeats(req, res, next) {
  try {
    const { seats } = req.body;
    if (!Array.isArray(seats) || seats.length === 0) return res.status(400).json({ error: 'seats required' });

    const query = { _id: req.params.id, reservedSeats: { $all: seats } };
    const update = {
      $pullAll: { reservedSeats: seats },
      $addToSet: { bookedSeats: { $each: seats } }
    };

    const updated = await Showtime.findOneAndUpdate(query, update, { new: true });
    if (!updated) return res.status(409).json({ error: 'seats not reserved' });
    return res.json({ success: true, showtime: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Release seats: move from reservedSeats -> availableSeats
 * body: { seats: ["A1"] }
 */
async function releaseSeats(req, res, next) {
  try {
    const { seats } = req.body;
    if (!Array.isArray(seats) || seats.length === 0) return res.status(400).json({ error: 'seats required' });

    const query = { _id: req.params.id, reservedSeats: { $all: seats } };
    const update = {
      $pullAll: { reservedSeats: seats },
      $addToSet: { availableSeats: { $each: seats } }
    };

    const updated = await Showtime.findOneAndUpdate(query, update, { new: true });
    if (!updated) return res.status(409).json({ error: 'seats not reserved' });
    return res.json({ success: true, showtime: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * List showtimes (optionally by movieId)
 */

async function listShowtimes(req, res, next) {
  try {
    const { movieId } = req.query;
    const filter = {};
    if (movieId) filter.movieId = movieId;
    const items = await Showtime.find(filter).populate('movieId').sort({ startTime: 1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createShowtime,
  getShowtime,
  lockSeats,
  confirmSeats,
  releaseSeats,
  listShowtimes
};
