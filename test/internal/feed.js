"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    feeds = require('../../lib/internal/feeds');

describe('Given a Feed created with a bus and an initial state,', function () {
  var feed, bus, initialState;

  beforeEach(function () {
    bus = doubles.makeBus();
    initialState = doubles.makeFeedState();

    feed = feeds.feed(bus, initialState);
  });

  describe('it can be chained:', function () {
    it('it has a chain() method', function () {
      expect(feed.chain).to.be.a('function');
    });

    describe('when chain is invoked with another feed,', function () {
      var anotherFeed, chainResult;
      beforeEach(function () {
        anotherFeed = doubles.makeFeed();

        chainResult = feed.chain(anotherFeed);
      });

      it('will subscribe the feed to the bus', function () {
        expect(bus.subscribe.calledOnce).to.be.ok();
        expect(bus.subscribe.calledOn(bus)).to.be.ok();
        expect(bus.subscribe.calledWithExactly(anotherFeed)).to.be.ok();
      });

      it('it will return a non null object', function () {
        expect(chainResult).to.be.an('object');
        expect(chainResult).not.to.be(null);
      });

      it('the object returned will have a chain() method', function () {
        expect(chainResult.chain).to.be.a('function');
      });

      it('the returned object will not be a feed', function () {
        expect(feeds.isFeed(chainResult)).not.to.be.ok();
      });

      describe("the returned object's chain() method will call the chained feed's chain() method", function () {
        var result, expectedResult, expectedArgument;

        beforeEach(function () {
          expectedArgument = 'some argument';
          expectedResult = "returned value from chained feed's chain() method";

          anotherFeed.chain.returns(expectedResult);

          result = chainResult.chain(expectedArgument);
        });

        it('only once', function () {
          expect(anotherFeed.chain.calledOnce).to.be.ok();
        });

        it('using the chained feed as the runtime context', function () {
          expect(anotherFeed.chain.calledOn(anotherFeed)).to.be.ok();
        });

        it('using the same argument passed', function () {
          expect(anotherFeed.chain.calledWithExactly(expectedArgument)).to.be.ok();
        });

        it('and will return the resulting value', function () {
          expect(result).to.be(expectedResult);
        });
      });
    });

    it('chain() will throw if bus.subscribe() throws', function () {
      bus.subscribe.throws();

      expect(function () {
        list.chain("some object");
      }).to.throwError();
    });

    describe('chain() will throw if a non feed object is passed:', function () {
      it('a undefined is not a feed', function () {
        expect(function () {
          list.chain();
        }).to.throwError();
      });
      it('a string is not a feed', function () {
        expect(function () {
          list.chain("some object");
        }).to.throwError();
      });
      it('an object without all the feeds methods is not a feed', function () {
        expect(function () {
          list.chain({chain:function () {
          }, done:function () {
          }});
        }).to.throwError();
      });
    });
  });

  function knowsHowToProcessEvent(event) {
    it("it has a method " + event + "()", function () {
      expect(feed[event]).to.be.a('function');
    });

    it(event + "() will return the feed itself", function () {
      expect(feed[event]('not important')).to.be(feed);
    });

    describe(event + "() will call " + event + "() on its current state:", function () {
      var data;
      beforeEach(function () {
        data = "some data";

        feed[event](data);
      });

      it('only once', function () {
        expect(initialState[event].calledOnce).to.be.ok();
      });

      it('using the current state as the runtime context', function () {
        expect(initialState[event].calledOn(initialState)).to.be.ok();
      });

      it('using the same argument passed', function () {
        expect(initialState[event].calledWithExactly(data)).to.be.ok();
      });
    });

    it(event + "() will set feed's next state to the state returned by the current one", function () {
      var nextState = doubles.makeFeedState();
      initialState[event].returns(nextState);

      feed[event]('not important');
      feed[event]();

      expect(initialState[event].calledOnce).to.be.ok();
      expect(nextState[event].calledOnce).to.be.ok();
    });
  }

  ['yield', 'throw', 'done'].forEach(knowsHowToProcessEvent);
});