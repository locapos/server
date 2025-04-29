export default class Mdl {
  mdlRipple(type: string) {
    return `mdl-${type} mdl-js-${type} mdl-js-ripple-effect`;
  }

  createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    clazz: string,
    parent: HTMLElement
  ): HTMLElementTagNameMap[K] {
    const control = document.createElement(tag);
    control.className = clazz;
    if (parent) parent.appendChild(control);
    return control;
  }

  createRippleElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    clazz: string,
    parent: HTMLElement
  ): HTMLElementTagNameMap[K] {
    return this.createElement(tag, `${this.mdlRipple(tag)} ${clazz}`, parent);
  }

  createCheckbox(label: string, id: string, parent: HTMLElement) {
    const control = this.createElement("label", this.mdlRipple("checkbox"), parent);
    control.htmlFor = id;
    const ui = this.createElement("input", "mdl-checkbox__input", control);
    ui.type = "checkbox";
    ui.id = id;
    const text = this.createElement("span", "mdl-checkbox__label", control);
    text.innerText = label;
    // This is not required?
    // (control as any).ui = ui;
    return control;
  }

  createButton(label: unknown, id: unknown, parent: HTMLElement) {
    return this.createRippleElement("button", "mdl-button--raised", parent);
  }
}
