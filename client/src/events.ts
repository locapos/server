export function handleEventOnce(
  element: HTMLElement | Document,
  event: string,
  handler: () => void
) {
  element.addEventListener(event, handler, { once: true });
}
