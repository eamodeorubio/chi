"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    feeds = require('../../../lib/internal/feeds');

describe('Given a FailedState with an error,', function () {
  var state, error;
  beforeEach(function () {
    error = 'some error';
    state = feeds.failedState(error);
  });

  function cannotDoAnymore(action) {
    describe('cannot "' + action + '" anymore:', function () {
      it('it has a ' + action + '() method', function () {
        expect(state[action]).to.be.a('function');
      });

      it(action + '() will throw', function () {
        expect(state[action]).to.throwError();
      });
    });
  }

  ['yields', 'throws', 'done'].forEach(cannotDoAnymore);

  it('when throw is invoked with the same error, it only will return itself', function () {
    expect(state.throws(error)).to.be(state);
  });
});