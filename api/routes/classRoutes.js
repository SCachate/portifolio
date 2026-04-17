const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, classController.getAll);
router.post('/', classController.create);
router.delete('/:id', classController.delete);
router.put('/:id', classController.update);

module.exports = router;