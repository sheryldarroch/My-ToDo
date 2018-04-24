'use strict';


const mongoose = require('mongoose');
const User = require('../models/user');

// ToDoItem Schema
const ToDoItemSchema = new mongoose.Schema({
  text: String,
  Completed: {type: Boolean, default: false}
});

// Instance Method to save ToDoItem edit
ToDoItemSchema.method("edit", (edits, callback) => {
  Object.assign(this, edits);
  this.parent().parent().save(callback);
});

// ToDoList Schema with ToDoItem as child
const ToDoListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  todolistname: String,
  todoitems: [ToDoItemSchema]
});


const ToDoList = mongoose.model('ToDoList', ToDoListSchema);
module.exports = ToDoList;
