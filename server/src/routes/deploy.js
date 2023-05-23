const express = require('express');
const router = express.Router();
const deployController = require('../controllers/deploy');

router.post('/', deployController.deploy);

module.exports = router;
