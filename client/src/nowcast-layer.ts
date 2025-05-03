import MapView from "./map-view";

const LatitudeRange = [20, 47.5];
const LongitudeRange = [120, 150];
const BlankGif = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const NowcastUrl = "https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json";

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
    const targetTimesN1 = await fetch(NowcastUrl);
    const targetTimesN1Json = await targetTimesN1.json<Array<{ basetime: string; validtime: string; }>>();
    const targetTimesN1Data = targetTimesN1Json[0];
    this.basetime = targetTimesN1Data.basetime;
    this.validtime = targetTimesN1Data.validtime;
  }

  getTile(tileCoord: google.maps.Point | null, zoom: number): Element | null {
    if (tileCoord == null) return null;
    // 利用可能なズームの中で一番近いものを選ぶ
    const available = [4, 6, 8, 10];
    const zNative = available.reduce((prev, curr) => Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev);
    // 一致するもしくは小さいレベルの画像を拡大して表示するパターン
    if (zNative <= zoom) {
      const scale = 1 << (zoom - zNative);
      const factor = this.#scalingParameters(tileCoord, scale);
      const { x, y } = factor.coord;
      const { x: xScale, y: yScale } = factor.scale;
      if (!this.#inRange(x, y, zNative)) {
        return null;
      }
      // タイルの座標を計算
      const tile = document.createElement("div");
      tile.style.width = "100%";
      tile.style.height = "100%";
      tile.style.backgroundImage = `url(${this.#getTileUrl(x, y, zNative)})`;
      tile.style.backgroundSize = `${scale * 100}% ${scale * 100}%`;
      tile.style.backgroundPosition = `${xScale}% ${yScale}%`;
      tile.style.backgroundRepeat = "no-repeat";
      tile.style.opacity = "0.5";
      return tile;
    }
    // 大きいレベルの画像を複数枚使用してさらに縮小して表示するパターン
    else {
      const scaleInv = 1 << (zNative - zoom);
      const scale = 1 / scaleInv;
      const factor = this.#scalingParameters(tileCoord, scale);
      const { x, y } = factor.coord;
      const backgroundImages = [];
      const backgroundSizes = [];
      const backgroundPositions = [];
      const backgroundRepeats = [];
      const outOfRangeFlags = [];
      for (let i = 0; i < scaleInv; i++) {
        for (let j = 0; j < scaleInv; j++) {
          if (!this.#inRange(x + i, y + j, zNative)) {
            outOfRangeFlags.push(true);
            backgroundImages.push(`url(${BlankGif})`);
          } else {
            backgroundImages.push(`url(${this.#getTileUrl(x + i, y + j, zNative)})`);
          }
          backgroundSizes.push(`${scale * 100}% ${scale * 100}%`);
          backgroundPositions.push(`${(i / (scaleInv - 1) * 100)}% ${(j / (scaleInv - 1) * 100)}%`);
          backgroundRepeats.push("no-repeat");
        }
      }
      if (outOfRangeFlags.length === scaleInv * scaleInv) {
        return null;
      }
      const tile = document.createElement("div");
      tile.style.width = "100%";
      tile.style.height = "100%";
      tile.style.backgroundImage = backgroundImages.join(", ");
      tile.style.backgroundSize = `${scale * 100}% ${scale * 100}%`;
      tile.style.backgroundPosition = backgroundPositions.join(", ");
      tile.style.backgroundSize = backgroundSizes.join(", ");
      tile.style.backgroundRepeat = backgroundRepeats.join(", ");
      tile.style.opacity = "0.5";
      return tile;
    }
  }

  releaseTile(): void { }

  #getTileUrl(x: number, y: number, z: number): string {
    if (y < 0) return BlankGif;
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

  // タイル座標とズームレベルからそのタイルが表示される範囲が事前に定義した緯度経度の範囲に収まるかどうかを判定する
  #inRange(x: number, y: number, z: number): boolean {
    // タイルの北西と南東の緯度経度を計算
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    const latNW = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    const longNW = x / Math.pow(2, z) * 360 - 180;

    const s = Math.PI - 2 * Math.PI * (y + 1) / Math.pow(2, z);
    const latSE = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(s) - Math.exp(-s)));
    const longSE = (x + 1) / Math.pow(2, z) * 360 - 180;

    // タイルの領域が定義された範囲と重なるかどうかをチェック
    const latOverlap = !(latSE > LatitudeRange[1] || latNW < LatitudeRange[0]);
    const longOverlap = !(longSE < LongitudeRange[0] || longNW > LongitudeRange[1]);

    return latOverlap && longOverlap;
  }

  alt: string = "Nowcast";
  maxZoom = 10;
  minZoom = 4;
  name = "Nowcast";
  projection: google.maps.Projection | null = null;
  radius: number = 6378137;
  tileSize = new google.maps.Size(256, 256);
}