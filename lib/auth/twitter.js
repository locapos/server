"use strict";

const TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER_KEY = 'YmqPT6NTP5DaAUcEZQEJ053W6';
const TWITTER_CONSUMER_SECRET = '7SnAdgfCiGThCOzWPwIEqti9YlhWmCAsjOEIMn83unHJdVwniQ';


module.exports = new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: 'https://atashi-coco.minamo.io/auth/twitter/callback'
    }, function(token, tokenSecret, profile, done){
        process.nextTick(function(){
	    console.log(profile);
            return done(null, {
                username: profile.screen_name,
		id: profile.id,
                provider: profile.provider,
                avatar: profile._json.profile_image_url_https
            });
        });
    }
);

