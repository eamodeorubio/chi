"use strict";

function Unit(output, factory) {
  this.yields = function (value) {
    output('yields', value);
    return this;
  };
  this.throws = function (error) {
    output('throws', error);
    return this;
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