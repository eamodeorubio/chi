"use strict";

module.exports = {
  stateFactory:function () {
    var me = {},
        plugins = {};

    function makeStateFactoryWithEmitterBindedTo(emit) {
      return function factory(name, opts) {
        return plugins[name](emit, factory, opts);
      };
    }

    me.registerPlugin = function (name, plugin) {
      plugins[name] = plugin;
    };

    me.makeStateFor = function (name, emit, opts) {
      var plugin = plugins[name];

      if (typeof plugin !== 'function')
        return;

      return plugin(emit, makeStateFactoryWithEmitterBindedTo(emit), opts);
    };

    return me;
  }
};