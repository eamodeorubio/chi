"use strict";

var expect = require('expect.js'),
    doubles = require('./doubles'),
    busModule = require('../lib/internal/bus'),
    chi = require('../lib/chi');

describe('An Emitter:', function () {
  var emitter, bus;

  beforeEach(function () {
    doubles.stubBusModule(busModule);
    bus = doubles.makeBus();
    busModule.EventBus.returns(bus);

    emitter = chi.emitter();
  });

  afterEach(function () {
    busModule.restoreOriginal();
  });

  describe('can be chained:', function () {
    it('it has a chain() method', function () {
      expect(emitter.chain).to.be.a('function');
    });

    describe('when chain is invoked with another feed,', function () {
      var aFeed, chainResult;
      beforeEach(function () {
        aFeed = doubles.makeFeed();

        chainResult = emitter.chain(aFeed);
      });

      it('will subscribe the feed to the bus', function () {
        expect(bus.subscribe.calledOnce).to.be.ok();
        expect(bus.subscribe.calledOn(bus)).to.be.ok();
        expect(bus.subscribe.calledWithExactly(aFeed)).to.be.ok();
      });

      it('it will return a non null object', function () {
        expect(chainResult).to.be.an('object');
        expect(chainResult).not.to.be(null);
      });

      it('the object returned will have a chain() method', function () {
        expect(chainResult.chain).to.be.a('function');
      });

      describe("the returned object's chain() method will call the chained feed's chain() method", function () {
        var result, expectedResult, expectedArgument;

        beforeEach(function () {
          expectedArgument = 'some argument';
          expectedResult = "returned value from chained feed's chain() method";

          aFeed.chain.returns(expectedResult);

          result = chainResult.chain(expectedArgument);
        });

        it('only once', function () {
          expect(aFeed.chain.calledOnce).to.be.ok();
        });

        it('using the chained feed as the runtime context', function () {
          expect(aFeed.chain.calledOn(aFeed)).to.be.ok();
        });

        it('using the same argument passed', function () {
          expect(aFeed.chain.calledWithExactly(expectedArgument)).to.be.ok();
        });

        it('and will return the resulting value', function () {
          expect(result).to.be(expectedResult);
        });
      });
    });

    it('chain() will throw if bus.subscribe() throws', function () {
      bus.subscribe.throws();

      expect(function () {
        emitter.chain("some object");
      }).to.throwError();
    });

    it('chain() will throw if a non feed object is passed', function () {
      expect(function () {
        emitter.chain("some object");
      }).to.throwError();
    });
  });

  describe('can yield values:', function () {
    var value = "yielded value";

    it('it has a yield() method', function () {
      expect(emitter.yield).to.be.a('function');
    });

    describe('when yield is invoked with a value, it', function () {
      var result;

      beforeEach(function () {
        result = emitter.yield(value);
      });

      it('will return itself', function () {
        expect(result).to.be(emitter);
      });

      it('will fire exactly once the "yield" event on the bus with the yielded value', function () {
        expect(bus.fire.calledOnce).to.be.ok();
        expect(bus.fire.calledOn(bus)).to.be.ok();
        expect(bus.fire.calledWithExactly('yield', value)).to.be.ok();
      });
    });
  });

  describe('can throw errors:', function () {
    var error = "throwed error";

    it('it has a throw() method', function () {
      expect(emitter.throw).to.be.a('function');
    });

    describe('when throw is invoked with a value, it', function () {
      var result;

      beforeEach(function () {
        result = emitter.throw(error);
      });

      it('will return itself', function () {
        expect(result).to.be(emitter);
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
      expect(emitter.done).to.be.a('function');
    });

    describe('when done is invoked, it', function () {
      var result;

      beforeEach(function () {
        result = emitter.done();
      });

      it('will return itself', function () {
        expect(result).to.be(emitter);
      });

      it('publish exactly once the "done" event on the bus', function () {
        expect(bus.publish.calledOnce).to.be.ok();
        expect(bus.publish.calledOn(bus)).to.be.ok();
        expect(bus.publish.calledWithExactly('done')).to.be.ok();
      });
    });
  });

  describe('can be completed:', function () {
    function completedEmitterCannotDo(event) {
      it('a call to "' + event + '" will throw and will not send any event', function () {
        expect(function () {
          emitter[event]('not important');
        }).to.throwError();
        if (event === 'yield')
          expect(bus.fire.called).not.to.be.ok();
        else
          expect(bus.publish.calledOnce).to.be.ok();
      });
    }

    describe('given it has been marked as done,', function () {
      beforeEach(function () {
        emitter.done();
      });

      ['yield', 'throw'].forEach(completedEmitterCannotDo);

      it('calling to done again will be ok, but no event will be sent', function () {
        emitter.done();

        expect(bus.publish.calledOnce).to.be.ok();
      });
    });

    describe('given it has been marked as throw,', function () {
      var error;
      beforeEach(function () {
        error = 'some error';
        emitter.throw(error);
      });

      ['yield', 'throw', 'done'].forEach(completedEmitterCannotDo);

      it('calling throw again with the same error will be ok, but no event will be sent', function () {
        emitter.throw(error);

        expect(bus.publish.calledOnce).to.be.ok();
      });
    });
  })
});