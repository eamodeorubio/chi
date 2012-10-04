"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    pluginsModule = require('../../lib/internal/plugins'),
    chiModule = require('../../lib/chi');

describe("A chi instance can be extended with plugins:", function () {
  var chi, plugins;
  beforeEach(function () {
    plugins = doubles.makePluginScope();

    doubles.stubPluginsModule(pluginsModule);
    pluginsModule.scope.returns(plugins);

    chi = chiModule.make();
  });

  afterEach(function () {
    pluginsModule.restoreOriginal();
  });

  it("has a registerPlugin function", function () {
    expect(chi.registerPlugin).to.be.a('function');
  });

  describe("given registerPlugin() has been called with a name and a function,", function () {
    var name, plugin, feedFactory;
    beforeEach(function () {
      name = "plugme";
      plugin = doubles.stubFunction();
      feedFactory = doubles.stubFunction();

      plugins.feedFactoryForPlugin.returns(feedFactory);

      chi.registerPlugin(name, plugin);
    });



    it("will register the plugin in the states module", function () {
      expect(plugins.registerPlugin.calledOnce).to.be.ok();
      expect(plugins.registerPlugin.calledWithExactly(name, plugin)).to.be.ok();
    });

    it("will ask the plugins module for a feed factory", function () {
      expect(plugins.feedFactoryForPlugin.calledOnce).to.be.ok();
      expect(plugins.feedFactoryForPlugin.calledWithExactly(name)).to.be.ok();
    });

    it("a factory method with the same name that the plugin will be available in chi", function () {
      expect(chi[name]).to.be.a('function');
    });

    describe("when the new factory method is called,", function () {
      var expectedResult;

      beforeEach(function () {
        expectedResult = 'expected result';

        feedFactory.returns(expectedResult);
      });

      it("it will return the feed built by the feed factory", function () {
        var result = chi[name]();

        expect(feedFactory.calledOnce).to.be.ok();
        expect(result).to.be(expectedResult);
      });

      it("without parameters, it will create a feed with busModule.emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name]();

        expect(feedFactory.calledOnce).to.be.ok();
        expect(feedFactory.calledWithExactly(busModule.emitter, [])).to.be.ok();
      });

      it("with false as a parameter, it will create a feed with busModule.emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name](false);

        expect(feedFactory.calledOnce).to.be.ok();
        expect(feedFactory.calledWithExactly(busModule.emitter, [])).to.be.ok();
      });

      it("with true as a parameter, it will create a feed with busModule.storage and a state factory created with the plugin name and an empty array", function () {
        chi[name](true);

        expect(feedFactory.calledOnce).to.be.ok();
        expect(feedFactory.calledWithExactly(busModule.storage, [])).to.be.ok();
      });

      it("with true and more parameters, it will create a feed with busModule.storage and a state factory created with the plugin name and an array with the extra parameters", function () {
        chi[name](true, '', 0);

        expect(feedFactory.calledOnce).to.be.ok();
        expect(feedFactory.calledWithExactly(busModule.storage, ['', 0])).to.be.ok();
      });

      it("with a first argument that is not a boolean, it will create a feed with busModule.emitter and a state factory created with the plugin name and an array with all parameters", function () {
        chi[name](1);

        expect(feedFactory.calledOnce).to.be.ok();
        expect(feedFactory.calledWithExactly(busModule.emitter, [1])).to.be.ok();
      });
    });
  });
});