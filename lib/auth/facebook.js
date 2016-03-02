"use strict";

const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: 'https://locapos-staging.minamo.io/auth/facebook/callback',
        enableProof: true
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
            return done(null, {
                username: profile.displayName || profile.username,
                id: profile.id,
                provider: profile.provider,
            });
        });
    }
);

