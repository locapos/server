export default class Mdl {
  mdlRipple(type: string) {
    return `mdl-${type} mdl-js-${type} mdl-js-ripple-effect`;
  }

  createElement<K extends keyof HTMLElementTagNameMap>(tag: K, clazz: string, parent: HTMLElement): HTMLElementTagNameMap[K] {
    let control = document.createElement(tag);
    control.className = clazz;
    if (parent) parent.appendChild(control);
    return control;
  }

  createRippleElement<K extends keyof HTMLElementTagNameMap>(tag: K, clazz: string, parent: HTMLElement): HTMLElementTagNameMap[K] {
    return this.createElement(tag, `${this.mdlRipple(tag)} ${clazz}`, parent);
  }

  createCheckbox(label: string, id: string, parent: HTMLElement) {
    let control = this.createElement('label', this.mdlRipple('checkbox'), parent);
    control.htmlFor = id;
    let ui = this.createElement('input', 'mdl-checkbox__input', control);
    ui.type = 'checkbox';
    ui.id = id;
    let text = this.createElement('span', 'mdl-checkbox__label', control);
    text.innerText = label;
    (control as any).ui = ui;
    return control;
  }

  createButton(label: unknown, id: unknown, parent: HTMLElement) {
    return this.createRippleElement('button', 'mdl-button--raised', parent);
  }
}
