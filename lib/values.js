'use strict';

class Values{
  isTrue(v){
    v = v.toLowerCase();
    return v === 't' || v === 'true' || v === '1';
  }
  isFalse(v){
    return !this.isTrue(v);
  }
}

module.exports = new Values();