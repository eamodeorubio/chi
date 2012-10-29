"use strict";

function makeUnit(emit, makeState) {
  var me={};

  me.yields = function (value) {
    emit('yields', value);
    return me;
  };
  me.throws = function (error) {
    emit('throws', error);
    return me;
  };
  me.done = function () {
    emit('done');
    return makeState('success');
  };

  return me;
}

module.exports = function (chi) {
  chi.registerPlugin('unit', function (emit, makeState /*, opts */) {
    return makeUnit(emit, makeState);
  });
};