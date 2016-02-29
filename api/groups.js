'use strict';

const router = require('express').Router();

const db = require('../lib/db.js')
      enforce = require('../lib/enforce.js');

router.get('/join', (req, res) => {
  res.sendStatus(404);
});

router.get('/new', (req, res) => {
  res.sendStatus(404);
});

module.exports = router;
