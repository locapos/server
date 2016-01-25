var Hash = (function(){
  var Hash = {};
  
  Hash.info = function(){
    var hash = location.hash.split('/');
    return {id: hash[1]};
  }

  Hash.setInfo = function(info){
    location.hash = '#!/' + info.id;
  }

  Hash.isLooking = function(id){
    return id === hashInfo().id;
  }

  Hash.toggleLookingFor = function(id){
    var info = {id: (this.isLooking() ? '' : id)};
    setHashInfo(info);
  }
  
  return Hash;
})();