'use strict';

class Mdl{
  mdlRipple(type){
    return `mdl-${type} mdl-js-${type} mdl-js-ripple-effect`;
  }

  createElement(tag, clazz, parent){
    let control = document.createElement(tag);
    control.className = clazz;
    if(parent) parent.appendChild(control);
    return control;
  }

  createRippleElement(tag, clazz, parent){
    return this.createElement(tag, `${this.mdlRipple(tag)} ${clazz}`, parent);
  }

  createCheckbox(label, id, parent){
    let control = this.createElement('label', this.mdlRipple('checkbox'), parent);
    control.htmlFor = id;
    let ui = this.createElement('input', 'mdl-checkbox__input', control);
    ui.type = 'checkbox';
    ui.id = id;
    let text = this.createElement('span', 'mdl-checkbox__label', control);
    text.innerText = label;
    control.ui = ui;
    return control;
  }

  createButton(label, id, parent){
    return this.createRippleElement('button', 'mdl-button--raised', parent);
  }
}

module.exports = new Mdl();
