'use strict';

const path = require('path');
const express = require('express')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , pugStatic = require('pug-static')
    , app = express()
    , server = require('http').createServer(app);

// clustering
/*
const cluster = require('cluster');
if(cluster.isMaster){
  let cpus = require('os').cpus().length;
  for(let i = 0; i < cpus; ++i) cluster.fork();
  cluster.on('exit', function(){
    cluster.fork();
  });
  return;
}

console.log('worker ' + process.pid);
*/

// check env vars
if(!process.env.FACEBOOK_APP_ID) throw 'Env `FACEBOOK_APP_ID` is not set';
if(!process.env.FACEBOOK_APP_SECRET) throw 'Env `FACEBOOK_APP_SECRET` is not set';
if(!process.env.GITHUB_CLIENT_ID) throw 'Env `GITHUB_CLIENT_ID` is not set';
if(!process.env.GITHUB_CLIENT_SECRET) throw 'Env `GITHUB_CLIENT_SECRET` is not set';
if(!process.env.GOOGLE_CLIENT_ID) throw 'Env `GOOGLE_CLIENT_ID` is not set';
if(!process.env.GOOGLE_CLIENT_SECRET) throw 'Env `GOOGLE_CLIENT_SECRET` is not set';
if(!process.env.WINDOWS_LIVE_CLIENT_ID) throw 'Env `WINDOWS_LIVE_CLIENT_ID` is not set';
if(!process.env.WINDOWS_LIVE_CLIENT_SECRET) throw 'Env `WINDOWS_LIVE_CLIENT_SECRET` is not set';

// setup
const auth = require('./lib/auth');
auth.install(passport);
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
  secret: process.env.SessionSecret,
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

app.set('view engine', 'pug');
app.use('/', pugStatic(path.resolve('./views')));
app.use('/', express.static('./public'));

// handle groups
app.get('/([a-zA-Z0-9_-]{38}|[a-zA-Z0-9_-]{43})?', (req, res) => {
  res.render('index');
});

// install socket.io
require('./lib/io.js')(server);

server.listen(process.env.PORT || 3000, process.env.ADDR || '127.0.0.1');
