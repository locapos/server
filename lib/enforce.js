const db = require('./db.js');

// send Authenticate required response
function sendRequireAuthentication(res, code){
    res.setHeader('WWW-Authenticate', 'Bearer realm=""');
    res.sendStatus(code);
}

module.exports = function(req, res, next){
  if(!req.headers.authorization) return sendRequireAuthentication(res, 401);
  let auth = req.headers.authorization.split(' ');
  if(auth[0] !== 'Bearer') return sendRequireAuthentication(res, 400);
  // check token
  db.getUser(auth[1])
    .then(u => { req.user = u; next(); })
    .catch(e => sendRequireAuthentication(res, 401));
}
