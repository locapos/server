export default class Events {
  static handleEventOnce(element: HTMLElement | Document, event: string, handler: () => void) {
    element.addEventListener(event, handler, { once: true });
  }
}
