const request = require('supertest');
const app = require('../src/server'); // path to your Express app
const mongoose = require('mongoose');
const Movie = require('../src/models/Movie');

require('./setup');

describe('Movie API', () => {
  it('should create a movie', async () => {
    const data = {
      title: 'The Matrix',
      description: 'Sci-fi action movie',
      durationMinutes: 136,
      posterUrl: 'https://example.com/matrix.jpg',
    };

    const res = await request(app)
      .post('/movies')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(data.title);
  });

  it('should list movies', async () => {
    // Create a movie first
    await Movie.create({
      title: 'Inception',
      description: 'Dream heist',
      durationMinutes: 148,
      posterUrl: 'https://example.com/inception.jpg',
    });

    const res = await request(app).get('/movies');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Inception');
  });

  it('should get a movie by ID', async () => {
    const movie = await Movie.create({
      title: 'Avatar',
      description: 'Sci-fi adventure',
      durationMinutes: 162,
      posterUrl: 'https://example.com/avatar.jpg',
    });

    const res = await request(app).get(`/movies/${movie._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Avatar');
  });

  it('should return 404 if movie not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/movies/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('movie not found');
  });

  it('should return movies in descending order of creation', async () => {
    await Movie.create({ title: 'Movie1', description: 'Desc1', durationMinutes: 100 });
    await Movie.create({ title: 'Movie2', description: 'Desc2', durationMinutes: 120 });

    const res = await request(app).get('/movies');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].title).toBe('Movie2'); // newest first
    expect(res.body[1].title).toBe('Movie1');
  });
});
