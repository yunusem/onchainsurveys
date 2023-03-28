const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    rrequired: function () {
      return !this.publicAddress;
    },
    unique: true,
  },
  publicAddress: {
    type: String,
    unique: true,
    sparse: true,
  },
});

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
