'use strict';

const router = require('express').Router();

const hashgen = require('../lib/hashgen.js')
    , db = require('../lib/db.js')
    , SqlDb = require('../lib/sqldb.js')
    , sdb = new SqlDb()
    , Q = require('q')
    , crypto = require('crypto');

router.get('/gentoken', (req, res) => {
  if(!req.query.client_id) return res.sendStatus(400);
  if(!req.query.signature) return res.sendStatus(400);
  if(!req.query.service) return res.sendStatus(400);
  if(!req.query.screen_name) return res.sendStatus(400);
  if(!req.query.id) return res.sendStatus(400);
  let avatar = req.query.avatar || '';

  sdb.select('secrets', {client_id: req.query.client_id})
    .then(ids => ids.length == 0 ? (() => { throw 400; })() : Q(ids[0].secret))
    .then(secret => {
      let hmac = crypto.createHmac('sha256', secret);
      hmac.update(req.query.client_id + req.query.service + req.query.id);
      let sig = hmac.digest('base64');
      if(sig != req.query.signature){ throw 401; }
      return Q({username: req.query.screen_name, default_username: req.query.screen_name,
        id: req.query.id, provider: req.query.service, avatar: avatar});
    })
    .then(user => {
      let prefix = hashgen.hmac(`${user.provider}:${user.id}`, process.env.CryptoHashKey);
      let token = `${prefix}!${hashgen.hash()}`;
      return db.searchUserToken(prefix)
        .then(v => {
          if(v.length == 0){
            return db.storeUser(token, user);
          }else{
            let t = v[0].split(':')[1];
            token = t;
            return db.extendsExpire(t);
          }
        })
        .then(_ => Q(token));
    })
    .then(token => res.send({key: token}))
    .catch(e => res.sendStatus(typeof(e) === 'number' ? e : 500));
});

module.exports = router;
