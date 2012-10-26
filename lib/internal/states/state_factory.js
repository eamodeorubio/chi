"use strict";

function ExtensibleStateFactory() {
  var plugins = {};

  function makeStateFactoryWithEmitterBindedTo(emit) {
    return function factory(name, opts) {
      return plugins[name](emit, factory, opts);
    };
  }

  this.registerPlugin = function (name, plugin) {
    plugins[name] = plugin;
  };

  this.makeStateFor = function (name, emit, opts) {
    var plugin = plugins[name];

    if (typeof plugin !== 'function')
      return;

    return plugin(emit, makeStateFactoryWithEmitterBindedTo(emit), opts);
  };
}

module.exports = {
  stateFactory:function () {
    return new ExtensibleStateFactory();
  }
};