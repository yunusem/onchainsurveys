const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  answers: [AnswerSchema],
});

const SurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [QuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Survey', SurveySchema);
