const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 3000;
const methodOverride = require('method-override');

const route = require('./routes');
const db = require('./config/db');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const setDefaults = require('./middleware/setDefaults');

// Connect to DB
db.connect()

// HTTP logger
app.use(morgan('combined'))

// Template engine setup
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

app.use(methodOverride('_method'));

app.use(setDefaults);

app.use(cookieParser());
app.use(session({
  secret: 'secret_key',  
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})