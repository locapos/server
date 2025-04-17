const ThemeColor = "theme-color";

export default class ThemeHelper {
  static setColor(color) {
    const meta = document.head.children.namedItem(ThemeColor);
    if (meta instanceof HTMLMetaElement) {
      meta.content = color;
    }
  }
}
