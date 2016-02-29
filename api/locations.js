'use strict';

const router = require('express').Router();

const db = require('../lib/db.js')
      enforce = require('../lib/enforce.js');

router.get('/update', enforce, (req, res) => {
  let obj = {
    provider: req.user.provider,
    id: req.user.id,
    name: req.user.username,
    latitude: parseFloat(req.query.latitude),
    longitude: parseFloat(req.query.longitude),
    heading: parseFloat(req.query.heading)
  };
  // check values
  if(isNaN(obj.latitude)) return res.sendStatus(400);
  if(isNaN(obj.longitude)) return res.sendStatus(400);
  if(isNaN(obj.heading)) obj.heading = 0;
  // store data
  let key = `${obj.provider}:${obj.id}`;
  db.storeLocation(key, obj)
    .then(v => res.send('ok'))
    .catch(e => res.sendStatus(500));
});

router.get('/delete', enforce, (req, res) => {
  let key = `${obj.provider}:${obj.id}`;
  db.deleteLocation(key)
    .then(v => res.send('ok'))
    .catch(e => res.sendStatus(500));
});

module.exports = router;
