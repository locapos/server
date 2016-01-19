'use strict';

const crypto = require('crypto');

const express = require('express')
    , router = express.Router();

const Easy = require('easy-redis')
    , easy = new Easy();

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
  let hash = crypto.createHash("sha256");
  if(!uri){
    res.sendStatus(400);
    return;
  }
  hash.update("" + Math.random() + Date.now());
  let token = hash.digest('base64');
  easy[token] = JSON.stringify(req.user);
  req.session.destroy(() => {
    res.redirect(`${uri}?token=${encodeURIComponent(token)}`);
  });
});

router.get('/failed', (req, res) => {
});

module.exports = router;
