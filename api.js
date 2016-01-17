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
  if(easy[auth[1]] === undefined){
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
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    heading: req.query.heading
  };
  easy.emit('update', JSON.stringify(obj));
  res.send('ok');
});

router.get('/show', enforce, (req, res) => {
  let obj = [
    {name: 'A', lat: 135.0, lon: 35.0},
    {name: 'B', lat: 140.0, lon: 35.0},
    {name: 'C', lat: 145.0, lon: 35.0},
    {name: 'D', lat: 130.0, lon: 35.0},
  ];
  res.send(obj);
});

module.exports = router;
