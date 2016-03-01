'use strict';

const router = require('express').Router();

const db = require('../lib/db.js')
    , enforce = require('../lib/enforce.js');

router.post('/update', enforce, (req, res) => {
  let obj = {
    provider: req.user.provider,
    id: req.user.id,
    name: req.user.username,
    latitude: parseFloat(req.body.latitude),
    longitude: parseFloat(req.body.longitude),
    heading: parseFloat(req.body.heading)
  };
  let group = req.body.key || '';
  let isprivate = req.body.private || '0';
  // check values
  if(isNaN(obj.latitude)) return res.sendStatus(400);
  if(isNaN(obj.longitude)) return res.sendStatus(400);
  if(isNaN(obj.heading)) obj.heading = 0;
  // group key must be 43 chars
  if(group.length != 0 && group.length != 43) return res.sendStatus(403);
  // store data
  let key = `${obj.provider}:${obj.id}`;
  db.storeLocation(key, obj, group, isprivate)
    .then(v => res.send('ok'))
    .catch(e => res.sendStatus(500));
});

router.post('/delete', enforce, (req, res) => {
  let group = req.body.key || '0';
  let key = `${req.user.provider}:${req.user.id}`;
  db.deleteLocation(key, group)
    .then(v => res.send('ok'))
    .catch(e => res.sendStatus(500));
});

module.exports = router;
