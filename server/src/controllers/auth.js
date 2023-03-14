const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password !== password) { return done(null, false); }
      return done(null, user);
    });
  }
));

exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return res.status(500).json({ message: err.message }); }
      if (!user) { return res.status(401).json({ message: 'Authentication failed' }); }
      req.logIn(user, (err) => {
        if (err) { return res.status(500).json({ message: err.message }); }
        return res.status(200).json({ message: 'Authentication successful' });
      });
    })(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
