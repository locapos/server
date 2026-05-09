const ThemeColor = "theme-color";

export function setThemeColor(color: string) {
  const meta = document.head.children.namedItem(ThemeColor);
  if (meta instanceof HTMLMetaElement) {
    meta.content = color;
  }
}

export function setActualColorScheme(color: "light" | "dark") {
  const meta = document.head.children.namedItem(ThemeColor);
  if (meta instanceof HTMLMetaElement) {
    setThemeColor(color === "dark" ? "#263238" : "#4DB6AC");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add(color);
  }
}

export function isDarkMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
