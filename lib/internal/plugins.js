"use strict";

var plugins = {};

function stateFactoryWithOutputBindedTo(output) {
  return function factory(name, opts) {
    return plugins[name](output, factory, opts);
  };
}

function stateFactoryBindedToPlugin(plugin, opts) {
  return function (output) {
    return plugin(output, stateFactoryWithOutputBindedTo(output), opts);
  };
}

var self = module.exports = {
  stateFactory:function (name, opts) {
    var plugin = plugins[name];
    if (typeof plugin !== 'function')
      return;
    return stateFactoryBindedToPlugin(plugin, opts);
  },
  registerPlugin:function (name, plugin) {
    plugins[name] = plugin;
  }
};