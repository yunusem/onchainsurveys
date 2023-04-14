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

const ResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
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
  responses: [ResponseSchema],
  creationFee: { type: Number, required: true , default: 5},
  rewardPerResponse: { type: Number, required: true, default: 1},
  participantsLimit: { type: Number, required: true, default: 10},
  minimumRequiredBalance: { type: Number, required: true, default: 10},
  minimumRequiredStake: { type: Number, required: true, default: 1},
  minimumAgeInDays: { type: Number, required: true, default: 1},
  validatorStatus: { type: Boolean, required: true, default: false},
});

module.exports = mongoose.model('Survey', SurveySchema);
