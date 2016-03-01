'use strict';

const router = require('express').Router();

const hashgen = require('../lib/hashgen.js')
    , db = require('../lib/db.js')
    , Q = require('q');

router.get('/authorize', (req, res) => {
  if(req.query.client_id !== 'AAAAAAAA') return res.sendStatus(400);
  if(!req.query.redirect_uri) return res.sendStatus(400);

  // manage session
  req.session.regenerate(() => {
    req.session.redirect_uri = req.query.redirect_uri;
    req.session.state = req.query.state || '';
    res.render('oauth/authorize');
  });
});

router.get('/redirect', (req, res) => {
  let uri = req.session.redirect_uri;
  if(!uri) return res.sendStatus(400);
  let token = hashgen();
  let state = req.session.state || '';
  db.storeUser(token, req.user)
    .then(v => Q.ninvoke(req.session, 'destroy'))
    .then(v => res.redirect(`${uri}#access_token=${encodeURIComponent(token)}&token_type=bearer&state=${encodeURIComponent(state)}`))
    .catch(v => res.sendStatus(500)); // if got exception, send 500 err.
});

router.get('/failed', (req, res) => {
  res.redirect('/authorize?error=1');
});

module.exports = router;
