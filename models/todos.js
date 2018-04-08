var mongoose = require('mongoose');
const User = require('../models/user');

var ToDoSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    todolistname: {
      type: String,
      required: true
    },
    todolist: [
      {
      todoitem: String,
      completed: Boolean
      }
    ]
});

var ToDo = mongoose.model('ToDo', ToDoSchema);
module.exports = ToDo;
