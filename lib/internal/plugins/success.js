"use strict";

var Success = {
  yields:function (value) {
    throw 'Cannot yield new values, because it has completed succesfuly';
  },
  throws:function (error) {
    throw 'Cannot throw an error, because it has completed succesfuly';
  },
  done:function () {
    return this;
  }
};

module.exports = function (chi) {
  chi.registerPlugin('success', function (/* output, factory, opts */) {
    return Success;
  });
};