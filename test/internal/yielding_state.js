"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    feeds = require('../../lib/internal/feeds');

describe('Given a YieldingState', function () {
  var bus, stateFactory;
  beforeEach(function () {
    bus = doubles.makeBus();
    stateFactory = doubles.makeFeedStateFactory();
  });

  function canYieldUsing(notificationType) {
    describe('created with a bus, a "' + notificationType + '" notification type and a state factory,', function () {
      var state;
      beforeEach(function () {
        state = feeds.yieldingState(bus, notificationType, stateFactory);
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

          it('will ' + notificationType + ' exactly once the "yield" event on the bus with the data', function () {
            expect(bus[notificationType].calledOnce).to.be.ok();
            expect(bus[notificationType].calledOn(bus)).to.be.ok();
            expect(bus[notificationType].calledWithExactly('yield', data)).to.be.ok();
          });
        });
      });
    });
  }

  ['fire', 'publish'].forEach(canYieldUsing);

  describe('created with a bus and a state factory,', function () {
    var state;
    beforeEach(function () {
      state = feeds.yieldingState(bus, 'not important', stateFactory);
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
          stateFactory.failedState.withArgs(error).returns(failedState);

          result = state.throws(error);
        });

        it('will return a FailedState with the thrown error', function () {
          expect(result).to.be(failedState);
        });

        it('publish exactly once the "throw" event on the bus with the throwed error', function () {
          expect(bus.publish.calledOnce).to.be.ok();
          expect(bus.publish.calledOn(bus)).to.be.ok();
          expect(bus.publish.calledWithExactly('throw', error)).to.be.ok();
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
          stateFactory.successState.returns(successState);

          result = state.done();
        });

        it('will return a SuccessState', function () {
          expect(result).to.be(successState);
        });

        it('publish exactly once the "done" event on the bus', function () {
          expect(bus.publish.calledOnce).to.be.ok();
          expect(bus.publish.calledOn(bus)).to.be.ok();
          expect(bus.publish.calledWithExactly('done')).to.be.ok();
        });
      });
    });
  });
});