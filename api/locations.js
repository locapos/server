'use strict';

const router = require('express').Router();

const Q = require('q')
    , db = require('../lib/db.js')
    , enforce = require('../lib/enforce.js');

router.post('/update', enforce, (req, res) => {
  let obj = {
    provider: req.user.provider,
    id: req.user.id,
    name: req.user.username,
    latitude: parseFloat(req.body.latitude),
    longitude: parseFloat(req.body.longitude),
    heading: parseFloat(req.body.heading) % 360
  };
  let group = req.body.key || '';
  let isprivate = req.body.private || '0';
  // check values
  if(isNaN(obj.latitude)) return res.sendStatus(400);
  if(isNaN(obj.longitude)) return res.sendStatus(400);
  if(isNaN(obj.heading)) obj.heading = 0;
  // normalize heading 0 to 360
  obj.heading = obj.heading < 0 ? 360 + obj.heading : obj.heading;
  // group key must be 43 chars
  let groups = group.split(',');
  for(let i = 0; i < groups.length; ++i){
    if(groups[i].length != 0 && groups[i].length != 43) return res.sendStatus(403);
  }
  // store data
  let key = `${obj.provider}:${obj.id}`;
  Q.all(groups.map(g=>db.storeLocation(key, obj, g, isprivate)))
    .spread(v => res.send('ok'))
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
