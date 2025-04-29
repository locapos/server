import CustomLayer from "./custom-layer";

export default class NowcastLayer extends CustomLayer {
  getDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = ((now.getMinutes() / 10) | 0) * 10;

    return `${year}${this.stringify(month)}${this.stringify(day)}${this.stringify(hours)}${this.stringify(minutes)}`;
  }

  override getTileUrl(coord: google.maps.Point, zoom: number) {
    const shift = zoom - 1;
    const x = coord.x;
    const y = Math.pow(2, shift) - 1 - coord.y;
    const z = zoom + 1;
    return `http://weather.map.c.yimg.jp/weather?x=${x}&y=${y}&z=${z}&size=256&date=${this.getDate()}`;
  }

  private stringify(num: number) {
    return num < 10 ? "0" + num : num;
  }
}
