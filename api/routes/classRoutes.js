const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

router.get('/:userId', classController.getAll);
router.post('/', classController.create);
router.delete('/:id', classController.delete);
router.put('/:id', classController.update);

module.exports = router;