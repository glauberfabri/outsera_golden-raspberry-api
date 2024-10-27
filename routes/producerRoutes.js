const express = require('express');
const router = express.Router();
const producerService = require('../services/producerService');

router.get('/intervals', (req, res) => {
    producerService.calculateIntervals((intervals) => {
        res.json({
            min: [intervals.min[0]],
            max: [intervals.max[0]]
        });
    });
});

module.exports = router;
