'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User Schema
const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    }
});

// authenticate input against database
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({ email: email})
    .exec(function(error, user) {
      if (error) {
        return callback(error);
      } else if ( !user ) {
        let err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password , function(error, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
}

// hash password before saving in database
UserSchema.pre('save', function(next) {
    let user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
});

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


const User = mongoose.model('User', UserSchema);
const ToDoList = mongoose.model('ToDoList', ToDoListSchema);
module.exports = { User, ToDoList };
