"use strict";

var sinon = require('sinon');

module.exports = {
  makeFeed:function (optName) {
    return this.double(['yields', 'throws', 'done', 'chain'], optName ? optName : "<anonymous feed>");
  },
  makeFeedState:function (optName) {
    return this.double(['yields', 'throws', 'done'], optName ? optName : "<anonymous feed state>");
  },
  makeBus:function (optName) {
    return this.double(['subscribe', 'publish'], optName ? optName : "<anonymous bus>");
  },
  makeFeedFactoriesRegistry:function (optName) {
    return this.double(['factoryFor', 'registerFactoryFor', 'decorateWithPlugins'], optName ? optName : "<anonymous feed factories registry>");
  },
  makeStateFactory:function (optName) {
    return this.double(['registerPlugin', 'makeStateFor'], optName ? optName : "<anonymous state factory>");
  },
  makeFeedFactory:function (optName) {
    return this.double(['registerPlugin', 'makeFeedFor'], optName ? optName : "<anonymous feed factory>");
  },
  stubBusModule:function (busModule) {
    this.stubModule(busModule, ['emitter', 'storage']);
  },
  stubRegistryModule:function (registry) {
    this.stubModule(registry, ['feedFactoriesRegistry','stateFactory']);
  },
  stubPluginsModule:function (plugins) {
    this.stubModule(plugins, ['feedFactory']);
  },
  stubFeedsModule:function (feeds) {
    this.stubModule(feeds, ['feed', 'isFeed']);
  },
  stubFunction:function () {
    return sinon.stub();
  },
  stubModule:function (module, methods) {
    methods.forEach(function (methodName) {
      sinon.stub(module, methodName);
    });
    module.restoreOriginal = function () {
      methods.forEach(function (methodName) {
        module[methodName].restore();
      });
      delete module.restoreOriginal;
    };
  },
  "double":function (methodNames, optName) {
    var r = {
      toString:function () {
        return '[double ' + optName ? optName : '<anonymous>' + ']';
      }
    };
    methodNames.forEach(function (methodName) {
      r[methodName] = sinon.stub();
    });
    return r;
  }
};