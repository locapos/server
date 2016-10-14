'use strict';

class Geo{
  heading(from, to){
    let x1 = from.longitude / 180 * Math.PI,
        x2 = to.longitude / 180 * Math.PI,
        y1 = from.latitude / 180 * Math.PI,
        y2 = to.latitude / 180 * Math.PI;
    let dx = x2 - x1;
    let phi = Math.atan2(Math.sin(dx), Math.cos(y1) * Math.tan(y2) - Math.sin(y1) * Math.cos(dx))
    let heading = phi * 180 / Math.PI;
    if(Number.isNaN(heading) || (x1 == x2 && y1 == y2)){
      return undefined;
    }else{
      return heading < 0 ? 360 + heading : heading;
    }
  }
}

module.exports = new Geo();
