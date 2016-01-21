"use strict";

const TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER_KEY = 'YmqPT6NTP5DaAUcEZQEJ053W6';
const TWITTER_CONSUMER_SECRET = '7SnAdgfCiGThCOzWPwIEqti9YlhWmCAsjOEIMn83unHJdVwniQ';


module.exports = new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: 'https://katsucurry.minamo.io/auth/twitter/callback'
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
            return done(null, {
                username: profile.displayName || profile.username,
                id: profile.id,
                provider: profile.provider,
                avatar: profile._json.profile_image_url_https
            });
        });
    }
);

