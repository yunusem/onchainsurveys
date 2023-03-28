const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function () {
      return !this.publicAddress;
    },
  },
  email: {
    type: String,
    required: function () {
      return !this.publicAddress;
    },
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.publicAddress;
    },
  },
  publicAddress: {
    type: String,
    unique: true,
    sparse: true,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.publicAddress) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
