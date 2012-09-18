"use strict";

var expect = require('expect.js'),
    doubles = require('./doubles'),
    utils = require('../lib/internal/utils'),
    chi = require('../lib/chi');

describe('An Emitter:', function () {
  var anEmitter, originalEventBus, aBus, originalIsFeed;

  beforeEach(function () {
    doubles.stubUtilsModule(utils);
    aBus = doubles.makeBus();
    utils.EventBus.returns(aBus);

    anEmitter = chi.emitter();
  });

  afterEach(function () {
    utils.restoreOriginal();
  });

  describe('can be chained:', function () {
    it('it has a chain() method', function () {
      expect(anEmitter.chain).to.be.a('function');
    });

    describe('when chain is invoked with another feed,', function () {
      var aFeed, chainResult;
      beforeEach(function () {
        utils.isFeed.returns(true);
        aFeed = doubles.makeFeed();

        chainResult = anEmitter.chain(aFeed);
      });

      it('will subscribe the feed to the bus', function () {
        expect(aBus.subscribe.calledOnce).to.be.ok();
        expect(aBus.subscribe.calledOn(aBus)).to.be.ok();
        expect(aBus.subscribe.calledWithExactly(aFeed)).to.be.ok();
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
      utils.isFeed.returns(true);
      aBus.subscribe.throws();

      expect(function () {
        anEmitter.chain("some object");
      }).to.throwError();
    });

    it('chain() will throw if utils.isFeed() returns false', function () {
      utils.isFeed.returns(false);

      expect(function () {
        anEmitter.chain("some object");
      }).to.throwError();
    });
  });

  describe('can yield values:', function () {
    var value = "yielded value";

    it('it has a yield() method', function () {
      expect(anEmitter.yield).to.be.a('function');
    });

    describe('when yield is invoked with a value, it', function () {
      var result;

      beforeEach(function () {
        result = anEmitter.yield(value);
      });

      it('will return itself', function () {
        expect(result).to.be(anEmitter);
      });

      it('will publish exactly once the "yield" event on the bus with the yielded value', function () {
        expect(aBus.publish.calledOnce).to.be.ok();
        expect(aBus.publish.calledOn(aBus)).to.be.ok();
        expect(aBus.publish.calledWithExactly('yield', value)).to.be.ok();
      });
    });
  });

  describe('can throw errors:', function () {
    var error = "throwed error";

    it('it has a throw() method', function () {
      expect(anEmitter.throw).to.be.a('function');
    });

    describe('when throw is invoked with a value, it', function () {
      var result;

      beforeEach(function () {
        result = anEmitter.throw(error);
      });

      it('will return itself', function () {
        expect(result).to.be(anEmitter);
      });

      it('publish exactly once the "throw" event on the bus with the throwed error', function () {
        expect(aBus.publish.calledOnce).to.be.ok();
        expect(aBus.publish.calledOn(aBus)).to.be.ok();
        expect(aBus.publish.calledWithExactly('throw', error)).to.be.ok();
      });
    });
  });

  describe('can be marked as done:', function() {
    it('it has a done() method', function () {
      expect(anEmitter.done).to.be.a('function');
    });

    describe('when done is invoked, it', function () {
      var result;

      beforeEach(function () {
        result = anEmitter.done();
      });

      it('will return itself', function () {
        expect(result).to.be(anEmitter);
      });

      it('publish exactly once the "done" event on the bus with the throwed error', function () {
        expect(aBus.publish.calledOnce).to.be.ok();
        expect(aBus.publish.calledOn(aBus)).to.be.ok();
        expect(aBus.publish.calledWithExactly('done')).to.be.ok();
      });
    });
  });

  describe('can be completed:', function(){
    describe('given it has been marked as done,', function() {
      it('a call to yield will throw', function() {
        expect(function(){
          anEmitter.yield('not important');
        }).to.throwError();
      });
    });
  })
});