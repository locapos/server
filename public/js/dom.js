(function(){
  var Mdl = {};

  Mdl.createElement = function(tag, clazz, parent){
    var control = document.createElement(tag);
    control.className = clazz;
    if(parent) parent.appendChild(control);
    return control;
  };

  Mdl.createCheckbox = function(label, id, parent){
    var control = Mdl.createElement('label', 'mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect', parent);
    label.htmlFor = id;
    var ui = Mdl.createElement('input', 'mdl-checkbox__input', control);
    ui.type = 'checkbox';
    ui.id = id;
    var text = Mdl.createElement('span', 'mdl-checkbox__label', control);
    text.innerText = label;
    control.ui = ui;
    return control;
  };

  Mdl.createButton = function(label, id, parent){
    var control = Mdl.createElement('button', 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect', parent);
    return control;
  };

  window.Mdl = Mdl;
})();
