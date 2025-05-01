import MapView from "./map-view";

export default class NowcastLayer {
  protected layer: NowcastImageMapType;
  private interval: number | null = null;

  constructor(private map: MapView) {
    this.layer = this.generateLayer();
  }

  async setVisible(b: boolean) {
    if (b) {
      await this.layer.fetchDate();
      this.map.getMapOverlays().push(this.layer);
      this.interval = window.setInterval(() => {
        this.swap();
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      const i = this.map.getMapOverlays().getArray().indexOf(this.layer);
      if (i >= 0) this.map.getMapOverlays().removeAt(i);
      window.clearInterval(this.interval);
      this.interval = null;
    }
  }

  async swap() {
    const layer = this.layer;
    this.layer = this.generateLayer();
    await this.layer.fetchDate();
    this.map.getMapOverlays().removeAt(this.map.getMapOverlays().getArray().indexOf(layer));
    this.map.getMapOverlays().push(this.layer);
  }

  private generateLayer() {
    return new NowcastImageMapType();
  }
}

class NowcastImageMapType implements google.maps.MapType {
  private basetime: string = "";
  private validtime: string = "";

  async fetchDate() {
    const targetTimesN1 = await fetch("https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json");
    const targetTimesN1Json = await targetTimesN1.json<Array<{ basetime: string; validtime: string; }>>();
    const targetTimesN1Data = targetTimesN1Json[0];
    this.basetime = targetTimesN1Data.basetime;
    this.validtime = targetTimesN1Data.validtime;
  }

  getTile(tileCoord: google.maps.Point | null, zoom: number): Element | null {
    if (tileCoord == null) return null;
    if (zoom < 4) return null;
    // 利用可能なズームの中で一番近いものを選ぶ
    const available = [4, 6, 8, 10];
    const zNative = available.reduce((prev, curr) => Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev);
    if (zNative === zoom) {
      const tile = document.createElement("img");
      tile.src = this.#getTileUrl(tileCoord.x, tileCoord.y, zoom);
      tile.style.opacity = "0.5";
      return tile;
    } else {
      const tile = document.createElement("div");
      const scale = 1 << (zoom - zNative);
      const factor = this.#scalingParameters(tileCoord, scale);
      const { x, y } = factor.coord;
      const { x: xScale, y: yScale } = factor.scale;
      tile.style.backgroundImage = `url(${this.#getTileUrl(x, y, zNative)})`;
      tile.style.backgroundRepeat = "no-repeat";
      tile.style.width = "100%";
      tile.style.height = "100%";
      tile.style.backgroundSize = `${scale * 100}% ${scale * 100}%`;
      tile.style.backgroundPosition = `${xScale}% ${yScale}%`;
      tile.style.backgroundRepeat = "no-repeat";
      tile.style.opacity = "0.5";
      return tile;
    }
  }

  releaseTile(): void { }

  #getTileUrl(x: number, y: number, z: number): string {
    return `https://www.jma.go.jp/bosai/jmatile/data/nowc/${this.basetime}/none/${this.validtime}/surf/hrpns/${z}/${x}/${y}.png`
  }

  #scalingParameters(tileCoord: google.maps.Point, scale: number) {
    const x = Math.floor(tileCoord.x / scale);
    const y = Math.floor(tileCoord.y / scale);
    const offsetX = tileCoord.x - x * scale;
    const offsetY = tileCoord.y - y * scale;
    return {
      coord: {
        x: x,
        y: y
      },
      scale: {
        x: offsetX / (scale - 1) * 100,
        y: offsetY / (scale - 1) * 100
      }
    }

  }

  alt: string = "Nowcast";
  maxZoom = 10;
  minZoom = 4;
  name = "Nowcast";
  projection: google.maps.Projection | null = null;
  radius: number = 6378137;
  tileSize = new google.maps.Size(256, 256);
}