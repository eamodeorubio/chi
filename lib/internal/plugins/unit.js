"use strict";

function Unit(output, factory) {
  this.yields = function (value) {
    output('yield', value);
    return this;
  };
  this.throws = function (error) {
    output('throw', error);
    return factory('failed', [error]);
  };
  this.done = function () {
    output('done');
    return factory('success');
  };
}

module.exports = function (chi) {
  chi.registerPlugin('unit', function (output, factory /*, opts */) {
    return new Unit(output, factory);
  });
};