const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/pendencias/:userId', dashboardController.getPendencias);

module.exports = router;