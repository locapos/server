const express = require('express')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , app = express()
    , server = require('http').createServer(app);

const path = require('path');

const jadeStatic = require('./lib/jade/static');

const auth = require('./lib/auth');

app.set('view engine', 'jade');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

auth.install(passport);

// setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
  secret: 'atashi',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);

// handlers
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use('/oauth', require('./oauth.js'));
app.use('/api', require('./api.js'));

app.use('/', jadeStatic(path.resolve('./views')));
app.use('/', express.static('./public'));

// install socket.io
require('./io.js')(server);

server.listen(process.env.PORT);

