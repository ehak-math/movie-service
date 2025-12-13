/**
 * Seed script to create a movie + showtime for quick testing
 *
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/moviedb';

async function seed() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await Movie.deleteMany({});
    await Showtime.deleteMany({});

    const movie = await Movie.create({
      title: 'The Example Movie',
      description: 'Seed movie for testing',
      durationMinutes: 120
    });

    const seats = [];
    ['A', 'B', 'C'].forEach((row) => {
      for (let i = 1; i <= 8; i++) seats.push(`${row}${i}`);
    });

    const showtime = await Showtime.create({
      movieId: movie._id,
      startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
      auditorium: 'Hall 1',
      availableSeats: seats
    });

    console.log('Seeded movieId:', movie._id.toString());
    console.log('Seeded showtimeId:', showtime._id.toString());
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}
console.log('Seeding complete!');
seed();
