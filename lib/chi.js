"use strict";

function Emitter() {
  this.yield = function (value) {

  };
}

module.exports.emitter = function () {
  return new Emitter();
};