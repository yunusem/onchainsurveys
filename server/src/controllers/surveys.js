const Survey = require('../models/Survey');

exports.createSurvey = async (req, res) => {
  try {
    const survey = new Survey({
      title: req.body.title,
      description: req.body.description,
      options: req.body.options.map(option => ({ name: option })),
      createdBy: req.user._id,
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
    const surveys = await Survey.find();
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
    survey.options = req.body.options.map(option => ({ name: option }));
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
