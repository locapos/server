'use strict';

const router = require('express').Router();

const hashgen = require('../lib/hashgen.js')
    , db = require('../lib/db.js')
    , enforce = require('../lib/enforce.js');

router.get('/join', (req, res) => {
  let group = req.query.key || '';
  if(group == '') return res.sendStatus(400);
  res.redirect('locapos-api:///join?key=' + encodeURIComponent(group));
});

router.get('/new', (req, res) => {
  let key = hashgen();
  res.send({key: key});
});

module.exports = router;
