"use strict";

var feeds = require('./feed')
    , stateFactoryModule = require('./../states/state_factory')
    , feedFactoryModule = require('./feed_factory_registry');

function makeExtensibleFeedFactory(factoriesRegistry, stateFactory, makeFeed) {
  var me = {};

  function makeFeedFactoryFor(name) {
    return function (bus, opts) {
      return factoriesRegistry.decorateWithPlugins(makeFeed(bus, stateFactory.makeStateFor(name, bus.publish, opts)), bus);
    };
  }

  me.makeFeedFor = function (name, bus, opts) {
    return factoriesRegistry.factoryFor(name)(bus, opts);
  };

  me.registerPlugin = function (name, plugin) {
    stateFactory.registerPlugin(name, plugin);
    factoriesRegistry.registerFactoryFor(name, makeFeedFactoryFor(name));
  };

  return me;
}

module.exports = {
  feedFactory:function () {
    return makeExtensibleFeedFactory(feedFactoryModule.feedFactoriesRegistry(), stateFactoryModule.stateFactory(), feeds.feed);
  }
};