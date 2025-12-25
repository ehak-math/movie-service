const request = require("supertest");
const app = require("../src/server");
const mongoose = require("mongoose");
const Movie = require("../src/models/Movie");
const Showtime = require("../src/models/Showtime");

require("./setup");

describe("Showtime API", () => {
  let movie;
  let showtime;

  beforeEach(async () => {
    // Clear both collections before each test
    await Showtime.deleteMany({});
    await Movie.deleteMany({});

    // Create a fresh movie for each test
    movie = await Movie.create({
      title: "Interstellar",
      description: "Sci-fi adventure",
      durationMinutes: 169,
      posterUrl: "https://example.com/interstellar.jpg",
    });

    // Create a fresh showtime for each test
    showtime = await Showtime.create({
      movieId: movie._id,
      startTime: new Date(),
      auditorium: "Aud 1",
      availableSeats: ["A1", "A2", "A3"],
      reservedSeats: [],
      bookedSeats: [],
    });
  });

  it("should create a showtime", async () => {
    const res = await request(app)
      .post("/showtimes")
      .send({
        movieId: movie._id.toString(),
        startTime: new Date(),
        auditorium: "Aud 2",
        availableSeats: ["B1", "B2"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.auditorium).toBe("Aud 2");
  });

  it("should fail to create showtime with invalid movieId", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/showtimes")
      .send({
        movieId: fakeId.toString(),
        startTime: new Date(),
        auditorium: "Aud 3",
        availableSeats: ["C1", "C2"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("invalid movieId");
  });

  it("should get a showtime by ID", async () => {
    const res = await request(app).get(`/showtimes/${showtime._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.auditorium).toBe("Aud 1");
    expect(res.body.movieId._id).toBe(movie._id.toString());
  });

  it("should list showtimes", async () => {
    const res = await request(app).get("/showtimes");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should lock seats", async () => {
    const res = await request(app)
      .patch(`/showtimes/${showtime._id}/lock`)
      .send({ seats: ["A1", "A2"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.showtime.availableSeats).toEqual(["A3"]);
    expect(res.body.showtime.reservedSeats).toEqual(
      expect.arrayContaining(["A1", "A2"])
    );
  });

  it("should confirm seats", async () => {
    // lock first
    await request(app)
      .patch(`/showtimes/${showtime._id}/lock`)
      .send({ seats: ["A1", "A2"] });

    const res = await request(app)
      .patch(`/showtimes/${showtime._id}/confirm`)
      .send({ seats: ["A1", "A2"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.showtime.reservedSeats).toEqual([]);
    expect(res.body.showtime.bookedSeats).toEqual(
      expect.arrayContaining(["A1", "A2"])
    );
  });

  it("should release reserved seats", async () => {
    // lock first
    await request(app)
      .patch(`/showtimes/${showtime._id}/lock`)
      .send({ seats: ["A3"] });

    const res = await request(app)
      .patch(`/showtimes/${showtime._id}/release`)
      .send({ seats: ["A3"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.showtime.reservedSeats).toEqual([]);
    expect(res.body.showtime.availableSeats).toEqual(
      expect.arrayContaining(["A3"])
    );
  });
});
