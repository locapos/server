'use strict';

const crypto = require('crypto');

module.exports.hash = function(value, algo, encode){
  let hash = crypto.createHash(algo || 'sha256');
  hash.update(value || ('' + Math.random() + Date.now()));
  return hash.digest(encode || 'base64')
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

module.exports.hmac = function(value, secret, algo, encode){
  let hmac = crypto.createHmac(algo || 'sha256', secret);
  hmac.update(value || ('' + Math.random() + Date.now()));
  return hmac.digest(encode || 'base64')
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}
