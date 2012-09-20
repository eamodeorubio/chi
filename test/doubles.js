"use strict";

var sinon = require('sinon');

module.exports = {
  makeFeed:function (optName) {
    return this.double(['yield', 'throw', 'done', 'chain'], optName ? optName : "<anonymous feed>");
  },
  makeFeedState:function (optName) {
    return this.double(['yield', 'throw', 'done'], optName ? optName : "<anonymous feed state>");
  },
  makeFeedStateFactory:function (optName) {
    return this.double(['yieldingState', 'failedState', 'successState'], optName ? optName : "<anonymous state factory>");
  },
  makeBus:function (optName) {
    return this.double(['subscribe', 'fire', 'publish'], optName ? optName : "<anonymous bus>");
  },
  stubBusModule:function (utils) {
    sinon.stub(utils, "EventBus");
    utils.restoreOriginal = function () {
      utils.EventBus.restore();
      delete utils.restoreOriginal;
    };
  },
  stubFunction:function () {
    return sinon.stub();
  },
  "double":function (methodNames, optName) {
    var r = {
      toString:function () {
        return '[double ' + optName ? optName : '<anonymous>' + ']'
      }
    };
    methodNames.forEach(function (methodName) {
      r[methodName] = sinon.stub();
    });
    return r;
  }
};