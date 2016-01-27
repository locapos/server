'use strict';

const redis = require('promise-redis')()
    , db = redis.createClient()
    , channel = redis.createClient();

const LocationLifeTime = 5 * 60;

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
      handler(msg.substr(10));
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
    return db.get(`users:${key}`)
      .then(v => v ? JSON.parse(v) : (()=>{throw undefined})());
  }

  storeUser(key, obj){
    return db.set(`users:${key}`, JSON.stringify(obj));
  }

  storeLocation(key, obj){
    let data = JSON.stringify(obj);
    return db.setex(`location:${key}`, LocationLifeTime, data)
      .then(v => db.publish('update', value));
  }

  showLocations(){
    return db.keys('locations:*')
      .then(v => db.mget(v || []))
      .then(v => (v || []).map(JSON.parse));
  }

  deleteLocation(key){
    return db.del(`locations:${key}`);
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
