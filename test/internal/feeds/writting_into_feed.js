"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    feeds = require('../../../lib/internal/feeds/feed');

describe('A Feed is writtable:', function () {
  var feed, bus, initialState;

  beforeEach(function () {
    bus = doubles.makeBus();

    initialState = doubles.makeFeedState();

    feed = feeds.feed(bus, initialState);
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

  ['yields', 'throws', 'done'].forEach(knowsHowToProcessEvent);
});