const express = require('express')
    , passport = require('passport')
    , bodyParser = require('body-parser')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io')(server);

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

server.listen(process.env.PORT);

// --- realtime communication
const Easy = require('easy-redis')
    , easy = new Easy()
    , channel = new Easy();

// socket.io client management
easy.client.select('1', () => {
  io.on('connection', socket => {
    easy.client.keys('*', (err, keys) => {
      easy.client.mget(keys || [], (err, values) => {
        socket.emit('update', JSON.stringify(values || []));
      });
    });
  });
  
  easy.on('update', function(c, msg){
    io.emit(c, `[${msg}]`);
  });
});

// remove marker when client offline
channel.client.config('set', 'notify-keyspace-events', 'Kg');
channel.client.psubscribe('__keyspace@1__:*');
channel.client.on('pmessage', (pattern, channel, msg) => {
  if(msg === 'del'){
    io.emit('clear', channel.split(':')[1]);
  }
});

