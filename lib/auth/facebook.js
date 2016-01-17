"use strict";

const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_APP_ID = '1022184071156849';
const FACEBOOK_APP_SECRET = '131d2f25e618449d364c32b15c0b0e9a';

module.exports = new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
	clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: 'https://atashi-coco.minamo.io/auth/facebook/callback',
	enableProof: true
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
	    console.log(profile);
            return done(null, {
                username: profile.displayName,
		id: profile.id,
                provider: profile.provider,
            });
        });
    }
);

