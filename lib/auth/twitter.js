"use strict";

const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: 'https://locapos.com/auth/twitter/callback'
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
            return done(null, {
                username: profile.displayName || profile.username,
                default_username: profile.displayName || profile.username,
                id: profile.id,
                provider: profile.provider,
                avatar: profile._json.profile_image_url_https
            });
        });
    }
);

