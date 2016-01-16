"use strict";

const WindowsLiveStrategy = require('passport-windowslive').Strategy;

const WINDOWS_LIVE_CLIENT_ID = '0000000048182754';
const WINDOWS_LIVE_CLIENT_SECRET = '49m7GyGf6CGV-oA3CGc1924hIjtuziqa';

module.exports = new WindowsLiveStrategy({
        clientID: WINDOWS_LIVE_CLIENT_ID,
        clientSecret: WINDOWS_LIVE_CLIENT_SECRET,
        callbackURL: 'https://atashi-coco.minamo.io/auth/microsoft/callback'
    }, function(accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            return done(null, {
              username: profile.id,
              provider: profile.provider,
            });
        });
    }
);

module.exports.option = {
  scope: [ 'wl.basic' ]
};
