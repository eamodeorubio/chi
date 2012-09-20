"use strict";

var sinon = require('sinon');

module.exports = {
  makeFeed:function () {
    return this.double(['yield', 'throw', 'done', 'chain']);
  },
  makeBus:function () {
    return this.double(['subscribe', 'fire', 'publish']);
  },
  stubUtilsModule:function (utils) {
    sinon.stub(utils, "EventBus");
    utils.restoreOriginal = function () {
      utils.EventBus.restore();
      delete utils.restoreOriginal;
    }
  },
  "double":function (methodNames) {
    var r = {};
    methodNames.forEach(function (methodName) {
      r[methodName] = sinon.stub();
    });
    return r;
  }
};