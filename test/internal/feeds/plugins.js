"use strict";

var expect = require('expect.js'),
    sinon = require('sinon'),
    doubles = require('../../helpers/doubles'),
    feeds = require('../../../lib/internal/feeds');

describe("The module internal/feeds can be extended with plugins:", function () {
  it("has a registerPlugin function", function () {
    expect(feeds.registerPlugin).to.be.a('function');
  });

  describe("given registerPlugin() has been called with a name and a function,", function () {
    var name, plugin;
    beforeEach(function () {
      name = "plugme";
      plugin = doubles.stubFunction();

      feeds.registerPlugin(name, plugin);
    });

    describe("and given a feed has been created:", function () {
      var newFeed, busFactory, stateFactory;
      beforeEach(function () {
        var bus = doubles.makeBus();
        busFactory = doubles.stubFunction();
        busFactory.returns(bus);

        var initialState = doubles.makeFeedState();
        stateFactory = doubles.stubFunction();
        stateFactory.returns(initialState);

        newFeed = feeds.feed(busFactory, stateFactory);
      });

      it("the new feed will have a method with the same name that the plugin", function () {
        expect(newFeed[name]).to.be.a('function');
      });

      describe("when the plugged method is invoked with some arguments,", function () {
        var arg1, arg2, feedToChain, chainStub, result, expectedResult;
        beforeEach(function () {
          arg1 = "arg1";
          arg2 = "arg2";
          feedToChain = doubles.makeFeed();
          plugin.returns(feedToChain);
          expectedResult = 'expected result';

          chainStub = sinon.stub(newFeed, 'chain');
          chainStub.returns(expectedResult);

          result = newFeed[name](arg1, arg2);
        });

        afterEach(function () {
          chainStub.restore();
        });

        it("will call the plugin with the busFactory and the args as an array to create a new feed", function () {
          expect(plugin.calledOnce).to.be.ok();
          expect(plugin.calledWithExactly(busFactory, [arg1, arg2])).to.be.ok();
        });

        it("will call chain with the resulting feed", function () {
          expect(chainStub.calledOnce).to.be.ok();
          expect(chainStub.calledOn(newFeed)).to.be.ok();
          expect(chainStub.calledWithExactly(feedToChain)).to.be.ok();
        });

        it("will return the result of chaining feeds", function () {
          expect(result).to.be(expectedResult);
        });
      });
    });
  });
});