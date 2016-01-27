'use strict';

const crypto = require('crypto');

const express = require('express')
    , router = express.Router();

const db = require('./db.js');

router.get('/authorize', (req, res) => {
  if(req.query.client_id !== 'AAAAAAAA') return res.sendStatus(400);
  if(!req.query.redirect_uri) return res.sendStatus(400);

  // manage session
  req.session.regenerate(() => {
    req.session.redirect_uri = req.query.redirect_uri;
    res.render('oauth/authorize');
  });
});

router.get('/redirect', (req, res) => {
  let uri = req.session.redirect_uri;
  if(!uri) return res.sendStatus(400);
  let hash = crypto.createHash("sha256");
  hash.update("" + Math.random() + Date.now());
  let token = hash.digest('base64');
  db.storeUser(token, req.user)
    .then(v => Q.ninvoke(req.session, "destroy"))
    .then(v => res.redirect(`${uri}?token=${encodeURIComponent(token)}`))
    .catch(v => res.sendStatus(500)); // if got exception, send 500 err.
});

router.get('/failed', (req, res) => {
});

module.exports = router;
