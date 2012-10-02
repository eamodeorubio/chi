"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    states = require('../../../lib/internal/states');

describe('Given a FailedState with an error,', function () {
  var state, error;
  beforeEach(function () {
    error = 'some error';
    state = states.stateFactory('failed', [error])('not used');
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