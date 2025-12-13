const express = require('express');
const ctrl = require('../controllers/movie.controller');

const router = express.Router();

router.post('/', ctrl.createMovie);
router.get('/', ctrl.listMovies);
router.get('/:id', ctrl.getMovie);

module.exports = router;
