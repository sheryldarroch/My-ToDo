const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ToDo = require('../models/todos');
const ToDosList = require('./todoslist');

//GET /profile
router.get('/profile', (req, res, next) => {
  if(! req.session.userId) {
    let err = new Error('You are not logged in!');
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
    .exec((error, user) => {
      if(error) {
        return next(error);
      } else {
        return res.render('profile', {title: 'Profile', name: user.name});
      }
    });
});

// GET /Logout
router.get('/logout', (req, res, next) => {
  if (req.session) {
    //delet session object
    req.session.destroy((err) =>{
      if(err) {
        return next(err);
      } else {
        res.redirect('/');
      }
    });
  }
});

// GET /login
router.get('/login', (req, res, next) => {
  return res.render('login', {title: 'Log In'});
});

// POST /login
router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if(error || !user) {
        let err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    let err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /register
router.get('/register', (req, res, next) => {
  return res.render('register', {title: 'Sign Up'});
});

//POST /register
router.post('/register', (req, res, next) => {
  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {

      //confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        const err = new Error('Passwords do NOT match!');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      let userData = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      };

      // use schema's create method to insert document into Mongo
      User.create(userData, function(error, user) {
        if(error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

    } else {
      const err = new Error('All fields required');
      err.status = 400;
      return next(err);
    }
});

// GET /
router.get('/', (req, res, next) => {
  return res.render('index', {title: 'Home'});
});

// GET /about
router.get('/about', (req, res, next) => {
  return res.render('about', {title: "About"});
});

//POST /todo
router.post('/todo', (req, res, next) => {
  if( req.session.userId && req.body.todolistname) {

    //create object with form input
    let ToDoData = {
      user: User._id,
      todolistname: req.body.todolistname,
      todolist: ToDosList
    };

  // use schema's create method to insert document into Mongo
  Todo.create(ToDoData, function(error, user) {
    if(error) {
      return next(error);
    } else {
      req.session.userId = user._id;
      return res.redirect('/todo');
    }
  });

} else {
  const err = new Error('Your list needs a name.');
  err.status = 400;
  return next(err);
}
});

// GET /todo
router.get('/todo', (req, res, next) => {
  return res.render('todo', {title: "ToDo"});
});

module.exports = router;
