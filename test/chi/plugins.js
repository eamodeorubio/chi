"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    pluginsModule = require('../../lib/internal/plugins'),
    chiModule = require('../../lib/chi');

describe("A chi instance can be extended with plugins:", function () {
  var chi, feedFactory;
  beforeEach(function () {
    feedFactory = doubles.makeFeedFactory();

    doubles.stubBusModule(busModule);
    doubles.stubPluginsModule(pluginsModule);
    pluginsModule.feedFactory.returns(feedFactory);

    chi = chiModule.make();
  });

  afterEach(function () {
    pluginsModule.restoreOriginal();
    busModule.restoreOriginal();
  });

  it("has a registerPlugin function", function () {
    expect(chi.registerPlugin).to.be.a('function');
  });

  describe("given registerPlugin() has been called with a name and a function, it", function () {
    var name, plugin, emitter, storage;
    beforeEach(function () {
      name = "plugme";
      emitter='an emitter bus';
      storage='an storage bus';
      plugin = doubles.stubFunction();

      busModule.emitter.returns(emitter);
      busModule.storage.returns(storage);


      chi.registerPlugin(name, plugin);
    });

    it("will register the plugin in the states module", function () {
      expect(feedFactory.registerPlugin.calledOnce).to.be.ok();
      expect(feedFactory.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
    });

    it("a factory method with the same name that the plugin will be available in chi", function () {
      expect(chi[name]).to.be.a('function');
    });

    describe("when the new factory method is called,", function () {
      var expectedResult;

      beforeEach(function () {
        expectedResult = 'expected result';

        feedFactory.makeFeedFor.returns(expectedResult);
      });

      it("it will return the feed built by the feed factory", function () {
        var result = chi[name]();

        expect(feedFactory.makeFeedFor.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledOn(feedFactory)).to.be.ok();
        expect(result).to.be(expectedResult);
      });

      it("without parameters, it will create a feed with an emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name]();

        expect(busModule.emitter.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, emitter, [])).to.be.ok();
      });

      it("with false as a parameter, it will create a feed with an emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name](false);

        expect(busModule.emitter.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, emitter, [])).to.be.ok();
      });

      it("with true as a parameter, it will create a feed with a storage and a state factory created with the plugin name and an empty array", function () {
        chi[name](true);

        expect(busModule.storage.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, storage, [])).to.be.ok();
      });

      it("with true and more parameters, it will create a feed with a storage and a state factory created with the plugin name and an array with the extra parameters", function () {
        chi[name](true, '', 0);

        expect(busModule.storage.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, storage, ['', 0])).to.be.ok();
      });

      it("with a first argument that is not a boolean, it will create a feed with an emitter and a state factory created with the plugin name and an array with all parameters", function () {
        chi[name](1);

        expect(busModule.emitter.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, emitter, [1])).to.be.ok();
      });
    });
  });
});