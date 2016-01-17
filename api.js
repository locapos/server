'use strict';

const express = require('express')
    , router = express.Router();

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
  if(auth[0] !== 'AAAAAAAA'){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    return res.sendStatus(401);
  }
  next();
}

router.get('/update', enforce, (req, res) => {
  res.send('ok');
});

router.get('/show', enforce, (req, res) => {
  let obj = [
    {name: 'A', lat: 135.0, lon: 35.0},
    {name: 'B', lat: 140.0, lon: 35.0},
    {name: 'C', lat: 145.0, lon: 35.0},
    {name: 'D', lat: 130.0, lon: 35.0},
  ];
});

module.exports = router;
