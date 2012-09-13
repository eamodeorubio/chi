"use strict";

function Emitter() {
  this.yield = function (value) {

  };
  this.chain = function (feed) {

  };
}

module.exports.emitter = function () {
  return new Emitter();
};