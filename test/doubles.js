"use strict";

var sinon = require('sinon');

module.exports.makeFeed = function () {
  return {
    yield:sinon.stub(),
    chain:sinon.stub()
  };
}