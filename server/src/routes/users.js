const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

const usersController = require('../controllers/users');

router.post('/:userId', authMiddleware, usersController.getUser);
router.post('/:userId/activate', usersController.activateUser);
router.post('/:userId/sync', authMiddleware, usersController.syncUserDetail);

module.exports = router;
