'use strict';

const router = require('express').Router();

const hashgen = require('../lib/hashgen.js')
    , db = require('../lib/db.js')
    , SqlDb = require('../lib/sqldb.js')
    , sdb = new SqlDb('./db/clients.sqlite3')
    , Q = require('q');

router.get('/authorize', (req, res) => {
  // pre-check args
  if(req.query.response_type !== 'token') return res.sendStatus(400);
  if(!req.query.redirect_uri) return res.sendStatus(400);
  if(!req.query.client_id) return res.sendStatus(400);

  sdb.get().then(d => d.all('SELECT * FROM secrets WHERE secret = ?', req.query.client_id))
    .then(ids => ids.length == 0 ? (function(){throw 400})() : Q(''))
    .then(_ => Q.ninvoke(req.session, 'regenerate'))
    .then(_ => {
      // manage session
      req.session.redirect_uri = req.query.redirect_uri;
      req.session.state = req.query.state || '';
      res.render('oauth/authorize');
    })
    .catch(e => res.sendStatus(e === 400 ? 400 : 500));
});

router.get('/redirect', (req, res) => {
  let uri = req.session.redirect_uri;
  if(!uri) return res.sendStatus(400);
  let token = hashgen();
  let state = encodeURIComponent(req.session.state || '');
  let redirect = `${uri}#access_token=${encodeURIComponent(token)}&token_type=bearer&state=${state}`;
  db.storeUser(token, req.user)
    .then(v => Q.ninvoke(req.session, 'destroy'))
    .then(v => res.render('oauth/redirect', {uri: redirect}))
    .catch(v => res.sendStatus(500)); // if got exception, send 500 err.
});

router.get('/failed', (req, res) => {
  res.render('oauth/failed');
});

module.exports = router;
