"use strict";

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://locapos-staging.minamo.io/auth/google/callback',
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

module.exports.option = {
  scope: [ 'profile', 'https://www.googleapis.com/auth/plus.login' ]
};
