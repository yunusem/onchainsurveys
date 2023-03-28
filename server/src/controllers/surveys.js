const Survey = require('../models/Survey');

exports.createSurvey = async (req, res) => {
  console.log('create survey controller , User object:', req.user);
  try {
    console.log('Request body JSON:', JSON.stringify(req.body));

    // TODO: Improve Casper-related code to handle survey creation fees and survey rewards here
    const { creationFee, rewardPerResponse } = req.body;

    const survey = new Survey({
      title: req.body.title,
      description: req.body.description,
      questions: req.body.questions,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      createdBy: req.user._id,
      creationFee,
      rewardPerResponse,
    });
    await survey.save();
    res.status(201).json(survey);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate('createdBy');
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    if (req.user._id !== survey.createdBy.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    survey.title = req.body.title;
    survey.description = req.body.description;
    survey.questions = req.body.questions;
    await survey.save();
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    if (req.user._id !== survey.createdBy.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await survey.remove();
    res.json({ message: 'Survey deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitResponse = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    const response = {
      user: req.user._id,
      answers: req.body.answers,
    };
    survey.responses.push(response);
    await survey.save();
    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (err) {
    console.error('Error in submitResponse:', err);
    res.status(500).json({ message: err.message });
  }
};