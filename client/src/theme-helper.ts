'use strict';

class ThemeHelper {
  static setColor(color){
    document.head.children.namedItem("theme-color").content = color;
  }
}

module.exports = ThemeHelper;
