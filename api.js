'use strict';

const express = require('express')
    , router = express.Router();

const redis = require('promise-redis')()
    , users = redis.createClient()
    , locations = redis.createClient();

function sendRequireAuthentication(res, code){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    res.sendStatus(401);
}

function enforce(req, res, next){
  if(!req.headers.authorization) return sendRequireAuthentication(res, 401);
  let auth = req.headers.authorization.split(' ');
  if(auth[0] !== 'Bearer') return sendRequireAuthentication(res, 400);
  // check token
  users.get(auth[1])
    .then(value => {
      if(!value) return sendRequireAuthentication(res, 401);
      req.user = JSON.parse(users[auth[1]]);
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
  locations.select('1')
    .then(v => locations.setex(key, 5 * 60, value)) // expire data after 5 minutes
    .then(v => locations.publish('update', value))
    .done(v => res.send('ok'));
});

router.get('/show', enforce, (req, res) => {
  locations.select('1')
    .then(v => locations.keys('*'))
    .then(v => locations.mget(v || []))
    .done(v => res.send((values || []).map(JSON.parse)));
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
  locations.del(key)
    .then(v => locations.publish('clear', value))
    .done(v => res.send('ok'));
});

module.exports = router;
