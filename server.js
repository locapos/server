const path = require('path');
const express = require('express')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , jadeStatic = require('jade-static')
    , app = express()
    , server = require('http').createServer(app);

// setup
const auth = require('./lib/auth');
auth.install(passport);
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
  secret: 'atashi',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// handlers
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// delegate path
app.use('/auth', auth);
app.use('/oauth', require('./oauth'));
app.use('/api', require('./api'));

app.set('view engine', 'jade');
app.use('/', jadeStatic(path.resolve('./views')));
app.use('/', express.static('./public'));

// handle groups
app.get('/([a-zA-Z0-9_-]{38}|[a-zA-Z0-9_-]{43})', (req, res) => {
  res.render('index');
});

// install socket.io
require('./io.js')(server);

server.listen(process.env.PORT || 3000);
