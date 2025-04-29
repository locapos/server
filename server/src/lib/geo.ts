type GeoLocation = {
  latitude: number;
  longitude: number;
};

class Geo {
  heading(from: GeoLocation, to: GeoLocation) {
    const x1 = (from.longitude / 180) * Math.PI;
    const x2 = (to.longitude / 180) * Math.PI;
    const y1 = (from.latitude / 180) * Math.PI;
    const y2 = (to.latitude / 180) * Math.PI;
    const dx = x2 - x1;
    const phi = Math.atan2(Math.sin(dx), Math.cos(y1) * Math.tan(y2) - Math.sin(y1) * Math.cos(dx));
    const heading = (phi * 180) / Math.PI;
    if (Number.isNaN(heading) || (x1 == x2 && y1 == y2)) {
      return undefined;
    } else {
      return heading < 0 ? 360 + heading : heading;
    }
  }
}

export default new Geo();
