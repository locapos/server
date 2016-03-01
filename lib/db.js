'use strict';

const Q = require('q')
    , redis = require('promise-redis')()
    , db = redis.createClient()
    , channel = redis.createClient()
    , hashgen = require('../lib/hashgen.js')
    , values = require('../lib/values.js');

const LocationLifeTime = 5 * 60 // 5 minutes
    , CredentialLifeTime = 30 * 86400; // 30 days

const CryptoHashKey = 'N645SR9nHn2Ith7NlQY+ZYkOTLtoQIG8B5z1er7p2CDsZVRw';

// configure channel
channel.config('set', 'notify-keyspace-events', 'Egx');
channel.subscribe('__keyevent@0__:del', '__keyevent@0__:expired');
channel.subscribe('update');

// handler factory
const HandlerFactory = {
  del: function(handler){
    return (channel, msg) => {
      if(channel !== '__keyevent@0__:del') return;
      if(channel !== '__keyevent@0__:expired') return;
      if(!msg.startsWith("locations:")) return;
      let base = msg.substr(10);
      let key = msg.substr(0, msg.indexOf(':'));
      let value = msg.substr(msg.indexOf(':')+1);
      handler({key: key, value: value});
    }
  },
  update: function(handler){
    return (channel, msg) => {
      if(channel !== 'update') return;
      handler(`[${msg}]`);
    }
  }
};

// db wrapper
class Db {
  getUser(key){
    return db.expire(`users:${key}`, CredentialLifeTime)
      .then(v => db.get(`users:${key}`))
      .then(v => v ? JSON.parse(v) : (()=>{throw undefined})())
  }

  storeUser(key, obj){
    return db.setex(`users:${key}`, CredentialLifeTime, JSON.stringify(obj));
  }

  storeLocation(key, obj, group, isprivate){
    let data = JSON.stringify(obj);
    let update = JSON.stringify({key: primary, value: data});
    let primary = '0';
    if(values.isTrue(isprivate)) primary = this.getShareKey(obj);
    return db.setex(`locations:${primary}:${key}`, LocationLifeTime, data)
      .then(v => group === '' ? Q(0) : db.setex(`locations:${group}:${key}`, LocationLifeTime, data))
      .then(v => db.publish('update', update))
      .then(v => group === '' ? Q(0) : db.publish('update', update));
  }

  showLocations(group){
    group = group || '0';
    return db.keys(`locations:${group}:*`)
      .then(v => (v || []).length ? db.mget(v) : Q([])) 
      .then(v => (v || []).map(JSON.parse));
  }

  deleteLocation(key, group){
    group = group || '0'; // 0 is default map
    if(group === '*'){
      return db.keys(`locations:*:${key}`)
        .then(v => db.del(v || []));
    }
    return db.del(`locations:${group}:${key}`);
  }

  getShareKey(user){
    let provider = user.provider;
    let userid = user.id;
    return hashgen(`${CryptoHashKey}${provider}${userid}`, 'sha224');
  }

  on(event, handler){
    if(event === 'update'){
      channel.on('message', HandlerFactory.update(handler));
    }
    if(event === 'delete'){
      channel.on('message', HandlerFactory.del(handler));
    }
  }
}

module.exports = new Db();
