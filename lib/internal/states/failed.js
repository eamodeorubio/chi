"use strict";

function Failed(fail) {
  this.yields = function () {
    throw 'Cannot yield new values, because it has failed:[' + fail + ']';
  };
  this.throws = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, because it has yet failed with:[' + fail + ']';
    return this;
  };
  this.done = function () {
    throw 'Cannot be "done", because it has failed:[' + fail + ']';
  };
}

module.exports = function (chi) {
  chi.registerPlugin('failed', function (emit, makeState, opts) {
    return new Failed(opts[0]);
  });
};
