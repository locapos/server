'use strict';
  
class Hash{
  info(){
    let hash = location.hash.split('/');
    return {id: hash[1]};
  }

  setInfo(info){
    location.hash = '#!/' + info.id;
  }

  isLooking(id){
    return id !== undefined && id === this.info().id;
  }

  toggleLookingFor(id){
    let info = {id: (this.isLooking(id) ? '' : id)};
    this.setInfo(info);
  }
}

module.exports = new Hash();
