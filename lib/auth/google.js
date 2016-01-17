"use strict";

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const GOOGLE_CLIENT_ID = '483399348647-leq41d5sgt54p2kau9ttm9m7vq86m2ks.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '1E95q13OYtVFXhbBlmau-kLQ';

module.exports = new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://atashi-coco.minamo.io/auth/google/callback',
	passReqToCallback   : true
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
	    console.log(profile);
            return done(null, {
              username: profile.id,
              provider: profile.provider,
            });
        });
    }
);

module.exports.option = {
  scope: [ 'profile', 'https://www.googleapis.com/auth/plus.login' ]
};
