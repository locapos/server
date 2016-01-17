"use strict";

let fs = require('fs');
let path = require('path');

function staticJadeHandler(views){
    return function(req, res, next){
        let url = req.baseUrl + req.url;
        let jade = req.url.substr(req.baseUrl.length);

        if(jade.endsWith('/')) { jade += 'index' }
        if(path.basename(jade)[0] === '_') return next();

        fs.stat(path.join(views, jade + '.jade'), function(err, st){
            if(err) return next();
            res.render(jade.substr(1), {profile: req.user});
        });
    }
}

module.exports = staticJadeHandler;

