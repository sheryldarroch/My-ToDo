"use strict";

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const TodoList = require('../models/todolist');
const mid = require('../middleware');

router.param("lId", (req, res, next, id) => {
  ToDoList.findbyId(id, (err, doc) => {
    if(err) return next(err);
    if(!doc) {
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }
    req.todolist = doc;
    return next();
  });
});

//POST /todo
// Route for creating a todo list
router.post('/', mid.requiresLogin, (req, res, next) => {
  //if todolistname is in the request
  if (req.body.todolistname) {
      const todolist = new ToDoList(req.body);
      todolist.save((err, todolist) => {
        if(err) return next(err);
        res.status(201);
        res.render('todo', {title: 'ToDo', todolist: todolist});
      });
      //use create method to insert document into Mongo
      // ToDoList.create(req.body, (err, todolist)=> {
      //   if (err) {
      //     return next(err);
      //   } else {
      //     //save the todolistname to a session variable to pass to the redirect
      //     // req.session.listname = req.body.todolistname;
      //     // return res.redirect('todolist');
      //     res.json(todolist);
      //   }
      // });
  } else {
    const err = new Error('Your list needs a name.');
    err.status = 400;
    return next(err);
  }
});

// GET /todo
// Route for getting todo lists
router.get('/', mid.requiresLogin, (req, res, next) => {
  ToDoList.find({})
                  .sort({todolistname: -1})
                  .exec((err, todolists) => {
                      if(err) return next(err);
                      res.render('todo', {title: 'ToDo', todolists: todolists});
                    });
  //return res.render('todo', {title: 'ToDo'});
});

// GET /todo/:lId
// Route for specific todo list
router.get("/:lId", (req, res, next) => {
  res.render('Todo', req.todolist);
});

// DELETE /todo/:lId
// Delete a specific list
router.delete("/:lId", (req, res, next) => {

});

// POST /todo/:lId/items
// Route for creating an item
router.post("/:lId/items", (req, res, next) => {

});

// PUT /todo/:lId/items/:iId/togglecompleted
// Toggle completed for a specific item
router.put("/:lId/items/:iId/togglecompleted", (req, res, next) => {

});

// PUT /todo/:lId/items/:iId
// Edit a specific item
router.put("/:lId/items/:iId", (req, res, next) => {

});

// DELETE /todo/:lId/items/:iId
// Delete a specific item
router.delete("/:lId/items/:iId", (req, res, next) => {

});


//Get /todolist
router.get('/todolist', mid.requiresLogin, (req, res, next) => {
  // find the todolistname that was submitted
  Todos.findOne({ 'todolistname': req.session.listname})
    .exec((error, todos) => {
      if(error) {
        return next(error);
      } else {
        const todolistname = todos.todolistname;
        const todos = todos.todolist;
        const todolistId = todos._id;
        const templateData = {todolistname, todos, todolistId};
        res.render('todolist', {title: 'ToDoList', templateData })
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

module.exports = 'router';
