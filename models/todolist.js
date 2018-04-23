'use strict';


var mongoose = require('mongoose');
const User = require('../models/user');

// ToDoItem Schema
const ToDoItemSchema = new Schema({
  text: String,
  Completed: {type: Boolean, default: False}
});

// Instance Method to save ToDoItem edit
ToDoItemSchema.method("edit", (edits, callback) => {
  Object.assign(this, edits);
  this.parent().parent().save(callback);
});

// ToDoList Schema with ToDoItem as child
const ToDoListSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  todolistname: String,
  todolist: [ToDoItemSchema]
});

// var ToDoSchema = new mongoose.Schema({
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     todolistname: {
//       type: String,
//       required: true
//     },
//     todolist: [
//       {
//       todoitem: String,
//       completed: Boolean
//       }
//     ]
// });


const ToDoList = mongoose.model('ToDoList', ToDoListSchema);
module.exports = ToDoList;
