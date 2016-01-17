const express = require('express');
const app = express();

const passport = require('passport')
    , bodyParser = require('body-parser');

const auth = require('./lib/auth');

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
app.use('/', express.static('./public'));

app.use('/oauth', require('./oauth.js'));

app.get('/', function(req, res){
  res.send('ok');
});

app.listen(process.env.PORT);
