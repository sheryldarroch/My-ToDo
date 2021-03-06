const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Todos = require('../models/todos');
const mid = require('../middleware');

//GET /profile
router.get('/profile', mid.requiresLogin, (req, res, next) => {
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

//POST /todo
router.post('/todo', (req, res, next) => {
  //if todolistname is in the request
  if (req.body.todolistname) {

      //use create method to insert document into Mongo
      Todos.create(req.body, (err, todos)=> {
        if (err) {
          return next(err);
        } else {
          //save the todolistname to a session variable to pass to the redirect
          req.session.listname = req.body.todolistname;
          return res.redirect('todolist');
        }
      });
  } else {
    const err = new Error('Your list needs a name.');
    err.status = 400;
    return next(err);
  }
});

// GET /todo
router.get('/todo', mid.requiresLogin, (req, res, next) => {
  return res.render('todo', {title: 'ToDo'});
});

//Get /todolist
router.get('/todolist', mid.requiresLogin, (req, res, next) => {
  // find the todolistname that was submitted
  Todos.findOne({ 'todolistname': req.session.listname})
    .exec((error, todos) => {
      if(error) {
        return next(error);
      } else {
        return res.render('todolist', {title: 'ToDoList', todolistname: todos.todolistname, todos: todos.todolist, todolistId: todos._id })
      }
    });
});

//POST /additem
router.post('/additem', (req, res, next) => {
  if (req.body.todoiteminput !== "") {
    let todolistitem = {'todoitem': req.body.todoiteminput, "completed": false};
    Todos.findOneAndUpdate({'todolistname': req.session.listname}, {$push: {todolist: todolistitem}})
    .exec((error, todos) => {
        if (error) {
          return next(error);
        } else {
          return res.redirect('todolist');
       }
      });
    } else {
      return res.redirect('todolist');
    }
});

module.exports = router;
