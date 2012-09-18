"use strict";

var sinon = require('sinon');

module.exports = {
  makeFeed:function () {
    return {
      yield:sinon.stub(),
      chain:sinon.stub()
    };
  },
  makeBus:function () {
    return {
      subscribe:sinon.stub(),
      publishYield:sinon.stub(),
      publishError:sinon.stub()
    };
  }
};