const MarkerSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cg transform-origin='center' transform='rotate(##DEG##)'%3E%3Cpath d='m4.35 24.716 11.647-3.957.004-16.954L4.35 24.716z' style='fill:%23ff6260'/%3E%3Cpath d='M16.817 19.698 4.969 23.724' style='stroke:%23ffefef'/%3E%3Cpath d='M27.65 24.716 15.997 3.805v16.954l11.653 3.957z' style='fill:%23d10106'/%3E%3Cpath d='m15.817 19.915 11.218 3.792' style='opacity:.5;stroke:%23ffefef'/%3E%3Cpath d='M4.35 24.716 16.001 3.805 27.65 24.716l-11.653-3.957L4.35 24.716z' style='fill:none;stroke:%23231815;stroke-miterlimit:10;stroke-width:.75px'/%3E%3Cpath d='M0 0h32v32H0z' style='fill:none'/%3E%3C/g%3E%3C/svg%3E";

export function createMarkerIcon(angle: number) {
  const dataUrl = MarkerSvg.replace("##DEG##", angle.toString());
  return {
    url: dataUrl,
    size: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  };
}

export function createDotIcon(mode: string) {
  const m = mode == "E" ? "E" : "A";
  return {
    url: `/res/99/${m}.png`,
    scaledSize: new google.maps.Size(4, 4),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(2, 2),
  };
}
