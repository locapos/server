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

router.get('/share/', enforce, (req, res) => {
  let key = db.getShareKey(req.user);
  res.send({key: key});
});

module.exports = router;
