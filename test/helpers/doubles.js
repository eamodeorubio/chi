"use strict";

var sinon = require('sinon');

function methodsOf(obj) {
  return Object.keys(obj).filter(function (name) {
    return typeof obj[name] === 'function';
  });
}

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
  stubFunction:function() {
    return sinon.stub();
  },
  stubObject:function (obj) {
    var methods=methodsOf(obj);
    methods.forEach(function (methodName) {
      sinon.stub(obj, methodName);
    });
    obj.restoreOriginal = function () {
      methods.forEach(function (methodName) {
        obj[methodName].restore();
      });
      delete obj.restoreOriginal;
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