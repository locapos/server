'use strict';

(function(){
  var Hash = {};
  
  Hash.info = function(){
    var hash = location.hash.split('/');
    return {id: hash[1]};
  }

  Hash.setInfo = function(info){
    location.hash = '#!/' + info.id;
  }

  Hash.isLooking = function(id){
    return id !== undefined && id === this.info().id;
  }

  Hash.toggleLookingFor = function(id){
    var info = {id: (this.isLooking(id) ? '' : id)};
    this.setInfo(info);
  }
  
  window.Hash = Hash;
})();
