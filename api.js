'use strict';

const express = require('express')
    , router = express.Router();

const Easy = require('easy-redis')
    , easy = new Easy();

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
  if(!easy[auth[1]]){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    return res.sendStatus(401);
  }
  req.user = JSON.parse(easy[auth[1]]);
  next();
}

router.get('/update', enforce, (req, res) => {
  if(req.query.latitude === undefined) return res.sendStatus(400);
  if(req.query.longitude === undefined) return res.sendStatus(400);
  if(req.query.heading === undefined) return res.sendStatus(400);
  let obj = {
    provider: req.user.provider,
    id: req.user.id,
	name: req.user.username,
    latitude: parseFloat(req.query.latitude),
    longitude: parseFloat(req.query.longitude),
    heading: parseFloat(req.query.heading)
  };
  let key = `location.${obj.provider}:${obj.id}`;
  let value = JSON.stringify(obj);
  easy.emit('update', value);
  easy.client.setex(key, 5 * 60, value); // expire data after 5 minutes
  res.send('ok');
});

router.get('/show', enforce, (req, res) => {
  easy.client.keys('location.*', (err, keys) => {
    easy.client.mget(keys || [], (err, values) => {
	  res.send(values || []);
	});
  });
});

module.exports = router;
