"use strict";

var plugins = {}
    , feeds = require('./feeds');

function stateFactoryWithOutputBindedTo(output) {
  return function factory(name, opts) {
    return plugins[name](output, factory, opts);
  };
}

function stateFactoryForPlugin(plugin, opts) {
  return function (output) {
    return plugin(output, stateFactoryWithOutputBindedTo(output), opts);
  };
}

var self = module.exports = {
  feedFactoryForPlugin:function (name) {
    return function (makeBus, opts) {
      return feeds.feed(makeBus, self.stateFactory(name, opts));
    };
  },
  stateFactory:function (name, opts) {
    var plugin = plugins[name];
    if (typeof plugin !== 'function')
      return;
    return stateFactoryForPlugin(plugin, opts);
  },
  registerPlugin:function (name, plugin) {
    plugins[name] = plugin;
  }
};