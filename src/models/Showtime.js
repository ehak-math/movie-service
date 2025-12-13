const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  startTime: { type: Date, required: true },
  auditorium: { type: String, default: 'Main Hall' },
  // seats arrays: availableSeats initially contains all seat labels
  availableSeats: { type: [String], default: [] },
  reservedSeats: { type: [String], default: [] }, // locked (pending)
  bookedSeats: { type: [String], default: [] },   // confirmed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Showtime', showtimeSchema);
