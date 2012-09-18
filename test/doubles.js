"use strict";

var sinon = require('sinon');

module.exports = {
  makeFeed:function () {
    return {
      yield:sinon.stub(),
      throw:sinon.stub(),
      done:sinon.stub(),
      chain:sinon.stub()
    };
  },
  makeBus:function () {
    return {
      subscribe:sinon.stub(),
      notify:sinon.stub(),
      publish:sinon.stub()
    };
  },
  stubUtilsModule:function (utils) {
    sinon.stub(utils, "isFeed");
    sinon.stub(utils, "EventBus");
    utils.restoreOriginal = function () {
      utils.isFeed.restore();
      utils.EventBus.restore();
      delete utils.restoreOriginal;
    }
  }
};