const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: function () {
      return !this.publicAddress;
    },
    unique: true,
  },
  publicAddress: {
    type: String,
    unique: true,
    sparse: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
});

UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $ne: null } } });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('email') || this.publicAddress) {
    return next();
  }

  try {
    this.publicAddress = this.publicAddress;
    next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);
