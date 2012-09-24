"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    feeds = require('../../lib/internal/feeds'),
    chi = require('../../lib/chi');

describe("The module chi can be extended with plugins:", function () {
  it("has a registerPlugin function", function () {
    expect(chi.registerPlugin).to.be.a('function');
  });

  describe("given registerPlugin() has been called with a name and a function,", function () {
    var name, plugin;
    beforeEach(function () {
      name = "plugme";
      plugin = doubles.stubFunction();

      doubles.stubFeedsModule(feeds);

      chi.registerPlugin(name, plugin);
    });

    afterEach(function () {
      feeds.restoreOriginal();
    });

    it("will register the plugin in the feeds module", function () {
      expect(feeds.registerPlugin.calledOnce).to.be.ok();
      expect(feeds.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
    });

    it("then a factory method with the same name that the plugin will be available in chi", function () {
      expect(chi[name]).to.be.a('function');
    });

    describe("when the new factory method is called,", function () {
      var expectedBus;

      beforeEach(function () {
        expectedBus = doubles.makeBus();

        doubles.stubBusModule(busModule);

        busModule.EventBus.returns(expectedBus);
      });

      afterEach(function () {
        busModule.restoreOriginal();
      });

      it("it will create a new bus", function () {
        chi[name]();

        expect(busModule.EventBus.calledOnce).to.be.ok();
        expect(busModule.EventBus.calledWithNew()).to.be.ok();
      });

      it("it will return the feed built by the feeds module", function () {
        var expectedResult = 'expected result';

        feeds.feed.returns(expectedResult);

        expect(chi[name]()).to.be(expectedResult);
      });

      it("it will use the new bus and the state returned by the state factory to create the new feed", function () {
        var expectedInitialState = 'initial state';
        feeds.initialStateFor.returns(expectedInitialState);

        chi[name]();

        expect(feeds.initialStateFor.calledOnce).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(expectedBus, expectedInitialState)).to.be.ok();
      });

      it("without parameters, it will call the state factory with the new bus and 'fire' notification type", function () {
        chi[name]();

        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, 'fire')).to.be.ok();
      });

      it("with false as a parameter, it will call the state factory with the new bus and 'fire' notification type", function () {
        chi[name](false);

        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, 'fire')).to.be.ok();
      });

      it("with true as a parameter, it will call the state factory with the new bus and 'publish' notification type", function () {
        chi[name](true);

        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, 'publish')).to.be.ok();
      });

      it("with extra parameters, it will pass them to the state factory in an array", function () {
        chi[name](true, '', 0);

        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, 'publish', ['', 0])).to.be.ok();
      });
    });
  });
});