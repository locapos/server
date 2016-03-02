"use strict";

const WindowsLiveStrategy = require('passport-windowslive').Strategy;

module.exports = new WindowsLiveStrategy({
        clientID: process.env.WINDOWS_LIVE_CLIENT_ID,
        clientSecret: process.env.WINDOWS_LIVE_CLIENT_SECRET,
        callbackURL: 'https://locapos-staging.minamo.io/auth/windowslive/callback'
    }, function(accessToken, refreshToken, profile, done){
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
  scope: [ 'wl.basic' ]
};
