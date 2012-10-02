"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    states = require('../../../lib/internal/states');

describe('Given a SuccessState,', function () {
  var state;
  beforeEach(function () {
    state = states.stateFactory('success')('not used');
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

  ['yields', 'throws'].forEach(cannotDoAnymore);

  describe('can be marked as done:', function () {
    it('it has a done() method', function () {
      expect(state.done).to.be.a('function');
    });

    it('when done is invoked, it only will return itself', function () {
      expect(state.done()).to.be(state);
    });
  });
});