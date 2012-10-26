"use strict";

function Unit(emit, makeState) {
  this.yields = function (value) {
    emit('yields', value);
    return this;
  };
  this.throws = function (error) {
    emit('throws', error);
    return this;
  };
  this.done = function () {
    emit('done');
    return makeState('success');
  };
}

module.exports = function (chi) {
  chi.registerPlugin('unit', function (emit, makeState /*, opts */) {
    return new Unit(emit, makeState);
  });
};