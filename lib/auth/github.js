"use strict";

const GitHubStrategy = require('passport-github').Strategy;

module.exports = new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://locapos.com/auth/github/callback'
    }, function(accessToken, refreshToken, profile, done){
		console.log(profile);
        process.nextTick(function(){
            return done(null, {
              username: profile.displayName || profile.username,
              id: profile.id,
              provider: profile.provider,
              avatar: profile._json.avatar_url
            });
        });
    }
);

