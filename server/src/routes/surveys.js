const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

const surveysController = require('../controllers/surveys');

router.post('/', authMiddleware, surveysController.createSurvey);
router.get('/:id', surveysController.getSurvey);
router.get('/', surveysController.getSurveys);
router.put('/:id', authMiddleware, surveysController.updateSurvey);
router.delete('/:id', authMiddleware, surveysController.deleteSurvey);

module.exports = router;
