const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');

router.post('/:userId', usersController.getUser);
router.post('/:userId/activate', usersController.activateUser);
router.post('/:userId/sync', usersController.syncUserDetail);

module.exports = router;
