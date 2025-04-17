export default class Events {
  static handleEventOnce(element: HTMLElement | Document, event: string, handler: () => void) {
    element.addEventListener(event, (function () {
      return function f() {
        element.removeEventListener(event, f, false);
        handler();
      };
    })());
  }
}
