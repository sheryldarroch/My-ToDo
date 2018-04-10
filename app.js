const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

// mLab/mongodb connection using mongoose
mongoose.connect(process.env.MONGO_URI);
var db = mongoose.connection;
//mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
  secret: 'to do lists are awesome',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// make user ID available to templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
});

//mongo console.error
db.on('error', console.error.bind(console, 'connection error:'));

//parse incoming request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

//view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
const routes = require('./routes/index');
app.use(routes);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

//error handler
//define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//Listen on port 3000
app.listen(port, () => {
  console.log('Server running at http://oursite:' + port + '/');
});
