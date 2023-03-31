const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

const secret = 'clientside-secret';

// This function configures passport to use a local strategy for authentication
// It takes an email, password, and callback function as parameters
// It searches for a user with the provided email address in the database
// It uses bcrypt to compare the provided password with the hashed password in the database
// It passes the user object to the callback if authentication is successful
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null, false);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// This function is middleware for verifying the JWT token in the authorization header of a request
// It extracts the token from the header and decodes it with the secret key
// It sets the request user object with the decoded user id
// It calls the next middleware in the chain if the token is valid
// It returns an error response if the token is invalid or missing
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.user = { _id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authMiddleware, passport };
