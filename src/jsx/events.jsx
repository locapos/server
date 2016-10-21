'use strict';

class Events {
  static handleEventOnce(element, event, handler){
    element.addEventListener(event, (function(){
      return function f(){
        element.removeEventListener(event, f, false);
        handler();
      };
    })());
  }
}

module.exports = Events;
