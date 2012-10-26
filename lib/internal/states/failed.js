"use strict";

function Failed(fail) {
  this.yields = function () {
    throw 'Cannot yield new values, because it is completed with the following failure:[' + fail + ']';
  };
  this.throws = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, because it has been completed with the following failura:[' + fail + ']';
    return this;
  };
  this.done = function () {
    return this;
  };
}

module.exports = function (chi) {
  chi.registerPlugin('failed', function (emit, makeState, opts) {
    return new Failed(opts[0]);
  });
};
