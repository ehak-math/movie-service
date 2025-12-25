require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./server');

const MONGO = process.env.MONGO_URI || 'mongodb://mongo-user:27017/moviedb';
const PORT = process.env.PORT || 4002;


mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true,})
  .then(() => {
    console.log('Connected to Movie DB');
    app.listen(PORT, () => console.log(`Movie service listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
