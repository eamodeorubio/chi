"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    states = require('../../../lib/internal/states');

describe('An UnitState', function () {
  var output, factory, state;
  beforeEach(function () {
    output = doubles.stubFunction();
    factory = doubles.stubFunction();

    state = new states.UnitState(output, factory);
  });

  describe('can yield data:', function () {
    it('it has a yield() method', function () {
      expect(state.yields).to.be.a('function');
    });

    describe('when yield is invoked with some data, it', function () {
      var result, data;

      beforeEach(function () {
        data = "some data";

        result = state.yields(data);
      });

      it('will return the state itself', function () {
        expect(result).to.be(state);
      });

      it('will publish exactly once the "yield" event on the bus with the data', function () {
        expect(output.calledOnce).to.be.ok();
        expect(output.calledWithExactly('yield', data)).to.be.ok();
      });
    });
  });

  describe('can throw errors:', function () {
    it('it has a throw() method', function () {
      expect(state.throws).to.be.a('function');
    });

    describe('when throw is invoked with an error, it', function () {
      var result, error, failedState;

      beforeEach(function () {
        error = "some error";
        failedState = doubles.makeFeedState();
        factory.returns(failedState);

        result = state.throws(error);
      });

      it('will return a FailedState with the thrown error', function () {
        expect(factory.calledOnce).to.be.ok();
        expect(factory.calledWithExactly('failed', [error])).to.be.ok();

        expect(result).to.be(failedState);
      });

      it('publish exactly once the "throw" event on the bus with the throwed error', function () {
        expect(output.calledOnce).to.be.ok();
        expect(output.calledWithExactly('throw', error)).to.be.ok();
      });
    });
  });

  describe('can be marked as done:', function () {
    it('it has a done() method', function () {
      expect(state.done).to.be.a('function');
    });

    describe('when done is invoked, it', function () {
      var result, successState;

      beforeEach(function () {
        successState = doubles.makeFeedState();
        factory.returns(successState);

        result = state.done();
      });

      it('will return a SuccessState', function () {
        expect(factory.calledOnce).to.be.ok();
        expect(factory.calledWithExactly('success')).to.be.ok();

        expect(result).to.be(successState);
      });

      it('publish exactly once the "done" event on the bus', function () {
        expect(output.calledOnce).to.be.ok();
        expect(output.calledWithExactly('done')).to.be.ok();
      });
    });
  });
});