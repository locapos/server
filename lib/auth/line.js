'use strict';

const LineStrategy = require('passport-line').Strategy;

module.exports = new LineStrategy({
        channelID: process.env.LINE_CHANNEL_ID,
        channelSecret: process.env.LINE_CHANNEL_SECRET,
        callbackURL: 'https://locapos.com/auth/line/callback'
    }, function(accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            return done(null, {
              username: profile.displayName
              default_username: profile.displayName
              id: profile.id,
              provider: profile.provider,
              avatar: profile._json.pictureUrl
            });
        });
    }
);

