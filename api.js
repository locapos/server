'use strict';

const express = require('express')
    , router = express.Router();

const Easy = require('easy-redis')
    , users = new Easy()
    , locations = new Easy();

function enforce(req, res, next){
  if(!req.headers.authorization){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    res.sendStatus(401);
  }
  let auth = req.headers.authorization.split(' ');
  if(auth[0] !== 'Bearer'){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    return res.sendStatus(400);
  }
  // check token
  if(!users[auth[1]]){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    return res.sendStatus(401);
  }
  req.user = JSON.parse(users[auth[1]]);
  next();
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
  locations.client.select('1', () => {
    locations.emit('update', value);
    locations.client.setex(key, 5 * 60, value); // expire data after 5 minutes
    res.send('ok');
  });
});

router.get('/show', enforce, (req, res) => {
  locations.client.select('1', () => {
    locations.client.keys('*', (err, keys) => {
      locations.client.mget(keys || [], (err, values) => {
        res.send((values || []).map(JSON.parse));
      });
    });
  });
});

router.get('/me', enforce, (req, res) => {
  let obj = {
    provider: req.user.provider,
    id: req.user.id,
    name: req.user.username,
  };
  res.send(obj);
});

router.get('/delete', enforce, (req, res) => {
  let key = `${obj.provider}:${obj.id}`;
  locations.client.del(key);
  locations.emit('clear', value);
  res.send('ok');
});

module.exports = router;
