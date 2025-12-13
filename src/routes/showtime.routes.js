const express = require('express');
const ctrl = require('../controllers/showtime.controller');

const router = express.Router();

router.post('/', ctrl.createShowtime);
router.get('/', ctrl.listShowtimes);
router.get('/:id', ctrl.getShowtime);

// seat operations
router.patch('/:id/lock', ctrl.lockSeats);
router.patch('/:id/confirm', ctrl.confirmSeats);
router.patch('/:id/release', ctrl.releaseSeats);

module.exports = router;
