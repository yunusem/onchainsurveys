const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');

router.get('/', usersController.getUsers);
router.post('/:userId/activate', usersController.activateUser);

module.exports = router;
