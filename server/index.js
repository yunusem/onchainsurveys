const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const authMiddleware = require('./src/middlewares/auth');
const User = require('./src/models/User');
const Survey = require('./src/models/Survey');
const authController = require('./src/controllers/auth');
const surveysController = require('./src/controllers/surveys');
const usersController = require('./src/controllers/users');

const app = express();

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

// Auth Routes
app.post('/register', authController.register);
app.post('/login', authController.login);

// User Routes
app.get('/users', usersController.getUsers);

// Survey Routes
app.post('/surveys', authMiddleware, surveysController.createSurvey);
app.get('/surveys/:id', surveysController.getSurvey);
app.get('/surveys', surveysController.getSurveys);
app.put('/surveys/:id', authMiddleware, surveysController.updateSurvey);
app.delete('/surveys/:id', authMiddleware, surveysController.deleteSurvey);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server started on port 3000');
    });
  })
  .catch((err) => {
    console.error(err);
  });
