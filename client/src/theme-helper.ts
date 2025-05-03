const ThemeColor = "theme-color";

export default class ThemeHelper {
  static setColor(color: string) {
    const meta = document.head.children.namedItem(ThemeColor);
    if (meta instanceof HTMLMetaElement) {
      meta.content = color;
    }
  }

  static setActualColorScheme(color: "light" | "dark") {
    const meta = document.head.children.namedItem(ThemeColor);
    if (meta instanceof HTMLMetaElement) {
      ThemeHelper.setColor(color === "dark" ? "#263238" : "#4DB6AC");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add(color);
    }
  }

  static isDarkMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
}
