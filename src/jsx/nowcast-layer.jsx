'use strict';

const CustomLayer = require('./custom-layer.jsx');

class NowcastLayer extends CustomLayer{
  getDate(){
    let d = new Date();
    let x = (~~(d.getMinutes() / 5))*5 - 15;
    let s = (d.getMinutes() - x) * 60000;
    d = new Date(d.getTime() - s);
    return `${d.getYear() + 1900}${('0'+(d.getMonth()+1)).slice(-2)}${('0'+d.getDate()).slice(-2)}${('0'+d.getHours()).slice(-2)}${('0'+d.getMinutes()).slice(-2)}00`;
  }
  getTileUrl(coord, zoom){
    return `https://dufgzh2t.user.webaccel.jp/radar/${this.getDate()}/${zoom}/${coord.y}/${coord.x}.png`
  }
}

module.exports = NowcastLayer;
