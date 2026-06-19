const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const classController = require('../controllers/classController');

router.use(authMiddleware);

router.get('/', classController.getAllClasses);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;