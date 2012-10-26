"use strict";

var Success = {
  yields:function () {
    throw 'Cannot yield new values, because it has completed successfully';
  },
  throws:function () {
    throw 'Cannot throw an error, because it has completed successfully';
  },
  done:function () {
    return this;
  }
};

module.exports = function (chi) {
  chi.registerPlugin('success', function (/* emit, makeState, opts */) {
    return Success;
  });
};