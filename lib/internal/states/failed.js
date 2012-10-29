"use strict";

function makeFailedState(fail) {
  var me = {};

  me.yields = function () {
    throw 'Cannot yield new values, because it is completed with the following failure:[' + fail + ']';
  };
  me.throws = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, because it has been completed with the following failura:[' + fail + ']';
    return me;
  };
  me.done = function () {
    return me;
  };

  return me;
}

module.exports = function (chi) {
  chi.registerPlugin('failed', function (emit, makeState, opts) {
    return makeFailedState(opts[0]);
  });
};
