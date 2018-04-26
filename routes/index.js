'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

//GET /profile
router.get('/profile', mid.requiresLogin, (req, res, next) => {
  //find current user
  User.findById(req.session.userId)
    .exec((error, user) => {
      if(error) {
        return next(error);
      } else {
          console.log(user);
          res.render('profile', {title: 'Profile', name: user.name, todolists: user.todos});
      }
    });

    // ToDoList.find({})
    //                 .sort({todolistname: -1})
    //                 .exec((err, todolists) => {
    //                     if(err) return next(err);
    //                     return todolists;
    //                     // res.render('todo', {title: 'ToDo', todolists: todolists});
    //                   });
    // const title = 'Profile'
    // todolists = todolists;
    // const templateData = {title, name, todolists};
    // res.render('profile', templateData);
});

// GET /Logout
router.get('/logout', (req, res, next) => {
  if (req.session) {
    //delet session object
    req.session.destroy((err) =>{
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /login
router.get('/login', mid.loggedOut, (req, res, next) => {
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
        req.session.userId = User._id;
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
router.get('/register', mid.loggedOut, (req, res, next) => {
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


module.exports = router;
