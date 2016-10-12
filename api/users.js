'use strict';

const router = require('express').Router();

const db = require('../lib/db.js')
    , enforce = require('../lib/enforce.js');

router.get('/show', enforce, (req, res) => {
  db.showLocations(req.query.key || '0') // map '0' is default map
    .then(v => res.send(v))
    .catch(e => res.sendStatus(500));
});

router.get('/me', enforce, (req, res) => {
  res.send({
    provider: req.user.provider,
    id: req.user.id,
    name: req.user.username,
  });
});

router.get('/share', enforce, (req, res) => {
  let key = db.getShareKey(req.user);
  res.send({key: key});
});

router.post('/update', enforce, (req, res) => {
  let ok = false;
  if(!req.body) return res.sendStatus(403);
  // expand parameter to user struct
  if(req.body.screen_name){
    req.user.username = req.body.screen_name;
    ok = true;
  }
  if(req.body.screen_name === '' && req.user.default_username){
    req.user.username = req.user.default_username;
    ok = true;
  }
  // check args
  if(!ok) return res.sendStatus(403);
  // store user
  let key = req.headers.authorization.split(' ');
  db.storeUser(key[1], req.user)
    .then(x => res.send('ok'))
    .catch(x => res.sendStatus(500))
});

module.exports = router;
