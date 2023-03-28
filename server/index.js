require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./src/models/User');
const cors = require('cors');

const app = express();

app.use(cors());

// Middleware
app.use(express.json());

// Passport middleware
app.use(passport.initialize());
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

// Routes
app.use('/auth', require('./src/routes/auth'));
app.use('/users', require('./src/routes/users'));
app.use('/surveys', require('./src/routes/surveys'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(process.env.PORT || 3001, () => {
      console.log('Server started on port', process.env.PORT || 3001);
    });
  })
  .catch((err) => {
    console.error(err);
  });
