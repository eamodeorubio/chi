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

        busModule.emitter.returns(expectedBus);
        busModule.storage.returns(expectedBus);
      });

      afterEach(function () {
        busModule.restoreOriginal();
      });

      it("it will create a new bus", function () {
        chi[name]();

        expect(busModule.emitter.calledOnce || busModule.storage.calledOnce).to.be.ok();
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

      it("without parameters, it will call the state factory with an event emitter and and empty options array", function () {
        chi[name]();

        expect(busModule.emitter.calledOnce).to.be.ok();
        expect(busModule.storage.called).not.to.be.ok();
        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, [])).to.be.ok();
      });

      it("with false as a parameter, it will call the state factory with an event emitter and and empty options array", function () {
        chi[name](false);

        expect(busModule.emitter.calledOnce).to.be.ok();
        expect(busModule.storage.called).not.to.be.ok();
        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, [])).to.be.ok();
      });

      it("with true as a parameter, it will call the state factory an event storage and and empty options array", function () {
        chi[name](true);

        expect(busModule.storage.calledOnce).to.be.ok();
        expect(busModule.emitter.called).not.to.be.ok();
        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, [])).to.be.ok();
      });

      it("with extra parameters, it will pass them to the state factory in the options array", function () {
        chi[name](true, '', 0);

        expect(busModule.storage.calledOnce).to.be.ok();
        expect(busModule.emitter.called).not.to.be.ok();
        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, ['', 0])).to.be.ok();
      });

      it("with a first argument that is not a boolean, it will use an event emitter and pass the argument in the options array", function () {
        chi[name](1);

        expect(busModule.emitter.calledOnce).to.be.ok();
        expect(busModule.storage.called).not.to.be.ok();
        expect(feeds.initialStateFor.calledWithExactly(name, expectedBus, [1])).to.be.ok();
      });
    });
  });
});