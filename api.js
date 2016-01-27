'use strict';

const express = require('express')
    , router = express.Router();

const Q = require('q')
    , redis = require('promise-redis')(Q.Promise)
    , db = redis.createClient();

function sendRequireAuthentication(res, code){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    res.sendStatus(code);
}

function enforce(req, res, next){
  if(!req.headers.authorization) return sendRequireAuthentication(res, 401);
  let auth = req.headers.authorization.split(' ');
  if(auth[0] !== 'Bearer') return sendRequireAuthentication(res, 400);
  // check token
  db.get("users:" + auth[1])
    .then(value => {
      if(!value) return sendRequireAuthentication(res, 401);
      req.user = JSON.parse(value);
      next();
    });
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
  let value = JSON.stringify(obj);
  db.setex(`locations:${key}`, 5 * 60, value) // expire data after 5 minutes
    .then(v => db.publish('update', value))
    .then(v => res.send('ok'));
});

router.get('/show', enforce, (req, res) => {
  db.keys('locations:*')
    .then(v => db.mget(v || []))
    .then(v => res.send((v || []).map(JSON.parse)));
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
  db.del(`locations:${key}`)
    .then(v => res.send('ok'));
});

module.exports = router;
