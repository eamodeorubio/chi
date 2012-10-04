"use strict";

var plugins = {}
    , feeds = require('./feeds')
    , slice = Array.prototype.slice
    , self;

function pluggedMethod(feed, makeBus, feedFactory) {
  return function () {
    return feed.chain(feedFactory(makeBus, slice.call(arguments)));
  };
}

function decorateWithPlugins(feed, makeBus, feedFactoryFor) {
  for (var name in plugins) {
    if (plugins.hasOwnProperty(name))
      feed[name] = pluggedMethod(feed, makeBus, feedFactoryFor(name));
  }
  return feed;
}

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

self = module.exports = {
  feedFactoryForPlugin:function (name) {
    return function (makeBus, opts) {
      var feed = feeds.feed(makeBus, self.stateFactory(name, opts));
      decorateWithPlugins(feed, makeBus, self.feedFactoryForPlugin);
      return feed;
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