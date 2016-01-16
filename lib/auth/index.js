'use strict';

const SupportedStrategies = [
    'twitter', 'github', 'facebook', 'windowslive', 'google'
];

const express = require('express')
    , passport = require('passport')
    , router = express.Router();

function auth(provider, failure){
    let opt = undefined;
    if(failure) opt = {failureRedirect: failure};
    return passport.authenticate(provider, opt);
}

function authRouter(provider){
    let r = express.Router();
    let authFunc = auth(provider, '/login');
    let callback = function(req, res){ res.redirect('/'); };
    r.get(`/${provider}/`, authFunc, callback);
    r.get(`/${provider}/callback`, authFunc, callback);
    r.post(`/${provider}/`, authFunc, callback);
    r.post(`/${provider}/callback`, authFunc, callback);
    return r;
}

for(let i = 0; i < SupportedStrategies.length; ++i){
    router.use('/', authRouter(SupportedStrategies[i]));
}

router.install = function(passport){
    for(let i = 0; i < SupportedStrategies.length; ++i){
        passport.use(require(`./${SupportedStrategies[i]}.js`));
    }
}

module.exports = router;

