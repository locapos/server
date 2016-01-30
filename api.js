'use strict';

const express = require('express')
    , router = express.Router();

const db = require('./db.js');

function sendRequireAuthentication(res, code){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    res.sendStatus(code);
}

function enforce(req, res, next){
  if(!req.headers.authorization) return sendRequireAuthentication(res, 401);
  let auth = req.headers.authorization.split(' ');
  if(auth[0] !== 'Bearer') return sendRequireAuthentication(res, 400);
  // check token
  db.getUser(auth[1])
    .then(u => { req.user = u; next(); })
    .catch(e => sendRequireAuthentication(res, 401));
}

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

router.get('/show', enforce, (req, res) => {
  db.showLocations()
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

router.get('/delete', enforce, (req, res) => {
  let key = `${obj.provider}:${obj.id}`;
  db.deleteLocation(key)
    .then(v => res.send('ok'))
    .catch(e => res.sendStatus(500));
});

module.exports = router;
