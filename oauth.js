'use strict';

const express = require('express')
    , router = express.Router();

router.get('/authorize', (req, res) => {
  if(req.query.client_id !== 'AAAAAAAA') return res.sendStatus(400);
  if(!req.query.redirect_uri) return res.sendStatus(400);

  // manage session
  req.session.regenerate(() => {
    req.session.redirect_uri = req.query.redirect_uri;
    res.send('ok');
  });
});

router.get('/redirect', (req, res) => {
  let uri = req.session.redirect_uri;
  let token = 'AAAAAAAA';
  req.session.destroy() => {
    res.redirect(`${uri}?token=${token}`);
  });
});

module.exports = router;
