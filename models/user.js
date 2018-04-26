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
    },
    todos: [
      {
        listId: mongoose.Schema.Types.ObjectId,
        todoListName: String,
        todoItems: [
          {
            itemId: mongoose.Schema.Types.ObjectId,
            text: String,
            completed: {type: Boolean, default: false}
          }
        ]
      }
    ]
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

const User = mongoose.model('User', UserSchema);
module.exports = User;
