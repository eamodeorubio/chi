"use strict";

var sinon = require('sinon');

module.exports = {
  makeFeed:function (optName) {
    return this.double(['yields', 'throws', 'done', 'chain'], optName ? optName : "<anonymous feed>");
  },
  makeFeedState:function (optName) {
    return this.double(['yields', 'throws', 'done'], optName ? optName : "<anonymous feed state>");
  },
  makeFeedStateFactory:function (optName) {
    return this.double(['yieldingState', 'failedState', 'successState'], optName ? optName : "<anonymous state factory>");
  },
  makeBus:function (optName) {
    return this.double(['subscribe', 'publish'], optName ? optName : "<anonymous bus>");
  },
  stubBusModule:function (busModule) {
    this.stubModule(busModule, ['emitter', 'storage']);
  },
  stubFeedsModule:function (feeds) {
    this.stubModule(feeds, ['feed', 'yieldingState', 'failedState', 'isFeed', 'successState', 'initialStateFor', 'registerPlugin']);
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