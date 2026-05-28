const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
router.get('/dividendosB3', incomeController.dividendosB3);
module.exports = router;
