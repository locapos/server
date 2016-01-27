const express = require('express')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io')(server);

const path = require('path')
    , Q = require('q');

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

server.listen(process.env.PORT);

// --- realtime communication
const redis = require('promise-redis')(Q.Promise)
    , channel = redis.createClient()
    , db = redis.createClient();

const sendLogs = function(socket){
  return db.keys('locations:*')
    .then(v => db.mget(v || []))
    .then(v => Q(JSON.stringify((v || []).map(JSON.parse))))
    .then(v => socket.emit('sync', v));
}

// socket.io client management
io.on('connection', socket => {
  socket.on('sync', () => sendLogs(socket));
  sendLogs(socket);
});

// remove marker when client offline
channel.config('set', 'notify-keyspace-events', 'Egx');
// subscribe internal events
channel.subscribe('__keyevent@0__:del', '__keyevent@0__:expired');
// subscribe application events
channel.subscribe('update');
channel.on('message', (channel, msg) => {
  switch(channel){
    case '__keyevent@0__:del':
    case '__keyevent@0__:expired':
      if(msg.startsWith("locations:")){
        io.emit('clear', msg.substr(10));
      }
      return;
    case 'update':
      return io.emit('update', `[${msg}]`);
  }
});
