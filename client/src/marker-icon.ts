const MarkerSvg =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><g transform-origin='center' transform='rotate(##DEG##)'><polygon points='16 3.034 3.547 25.384 16 21.156 28.453 25.384 16 3.034' style='fill:%231f2020'/><polygon points='16 4.572 5.147 24.051 16 20.365 16 4.572' style='fill:%23fdeeee'/><polygon points='16 4.572 16 20.365 16 20.365 26.853 24.051 16 4.572 16 4.572' style='fill:%23dd7577'/><polygon points='5.816 22.851 16 19.392 16 4.572 5.816 22.851' style='fill:%23eb615e'/><polygon points='16 4.572 16 19.392 26.184 22.851 16 4.572' style='fill:%23c4181f'/></g></svg>";

export function createMarkerIcon(angle: number) {
  const dataUrl = MarkerSvg.replace("##DEG##", (angle || 0).toString());
  return {
    url: dataUrl,
    size: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  };
}

export function createDotIcon(mode: string) {
  const m = mode === "E" ? "E" : "A";
  return {
    url: `/res/99/${m}.png`,
    scaledSize: new google.maps.Size(4, 4),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(2, 2),
  };
}
