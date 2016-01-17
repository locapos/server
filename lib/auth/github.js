"use strict";

const GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = '91cbc98139c7a7fb102f';
const GITHUB_CLIENT_SECRET = '2ed96d795e4b7325f4cc122cdc6cdb92473853b5';

module.exports = new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: 'https://atashi-coco.minamo.io/auth/github/callback'
    }, function(accessToken, refreshToken, profile, done){
        process.nextTick(function(){
	    console.log(profile);
            return done(null, {
              username: profile.username,
              provider: profile.provider,
              avatar: profile._json.avatar_url
            });
        });
    }
);

