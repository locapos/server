'use strict';

const CustomLayer = require('./custom-layer.jsx');

class NowcastLayer extends CustomLayer{
  getDate(){
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hours = now.getHours();
    let minutes = (now.getMinutes() / 10 | 0) * 10;

    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    return `${year}${month}${day}${hours}${minutes}`;
  }
  getTileUrl(coord, zoom){
    let shift = zoom - 1;
    let x = coord.x;
    let y = Math.pow(2, shift) - 1 - coord.y;
    let z = zoom + 1;
    return `http://weather.map.c.yimg.jp/weather?x=${x}&y=${y}&z=${z}&size=256&date=${this.getDate()}`;
  }
}

module.exports = NowcastLayer;
