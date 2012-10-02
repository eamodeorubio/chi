"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    feeds = require('../../lib/internal/feeds'),
    states = require('../../lib/internal/states'),
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
      doubles.stubStatesModule(states);

      chi.registerPlugin(name, plugin);
    });

    afterEach(function () {
      feeds.restoreOriginal();
      states.restoreOriginal();
    });

    it("will register the plugin in the states module", function () {
      expect(states.registerPlugin.calledOnce).to.be.ok();
      expect(states.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
    });

    it("then a factory method with the same name that the plugin will be available in chi", function () {
      expect(chi[name]).to.be.a('function');
    });

    describe("when the new factory method is called,", function () {
      var stateFactory;

      beforeEach(function () {
        stateFactory = doubles.stubFunction();

        states.stateFactory.returns(stateFactory);
      });

      it("it will return the feed built by the feeds module", function () {
        var expectedResult = 'expected result';

        feeds.feed.returns(expectedResult);

        expect(chi[name]()).to.be(expectedResult);
      });

      it("without parameters, it will create a feed with busModule.emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name]();

        expect(states.stateFactory.calledOnce).to.be.ok();
        expect(states.stateFactory.calledWithExactly(name, [])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();
      });

      it("with false as a parameter, it will create a feed with busModule.emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name](false);

        expect(states.stateFactory.calledOnce).to.be.ok();
        expect(states.stateFactory.calledWithExactly(name, [])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();
      });

      it("with true as a parameter, it will create a feed with busModule.storage and a state factory created with the plugin name and an empty array", function () {
        chi[name](true);

        expect(states.stateFactory.calledOnce).to.be.ok();
        expect(states.stateFactory.calledWithExactly(name, [])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.storage, stateFactory)).to.be.ok();
      });

      it("with true and more parameters, it will create a feed with busModule.storage and a state factory created with the plugin name and an array with the extra parameters", function () {
        chi[name](true, '', 0);

        expect(states.stateFactory.calledOnce).to.be.ok();
        expect(states.stateFactory.calledWithExactly(name, ['', 0])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.storage, stateFactory)).to.be.ok();
      });

      it("with a first argument that is not a boolean, it will create a feed with busModule.emitter and a state factory created with the plugin name and an array with all parameters", function () {
        chi[name](1);

        expect(states.stateFactory.calledOnce).to.be.ok();
        expect(states.stateFactory.calledWithExactly(name, [1])).to.be.ok();

        expect(feeds.feed.calledOnce).to.be.ok();
        expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();
      });
    });
  });
});