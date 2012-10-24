"use strict";

function ExtensibleStateFactory() {
  var plugins = {};

  function makeStateFactoryWithOutputBindedTo(output) {
    return function factory(name, opts) {
      return plugins[name](output, factory, opts);
    };
  }

  this.registerPlugin = function (name, plugin) {
    plugins[name] = plugin;
  };

  this.makeStateFor = function (name, output, opts) {
    var plugin = plugins[name];

    if (typeof plugin !== 'function')
      return;

    return plugin(output, makeStateFactoryWithOutputBindedTo(output), opts);
  };
}

module.exports = {
  stateFactory:function () {
    return new ExtensibleStateFactory();
  }
};