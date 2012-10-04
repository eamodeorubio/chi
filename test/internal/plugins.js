"use strict";

var expect = require('expect.js'),
    sinon = require('sinon'),
    doubles = require('../helpers/doubles'),
    registry = require('../../lib/internal/plugins/registry'),
    feeds = require('../../lib/internal/feeds'),
    pluginsModule = require('../../lib/internal/plugins');

describe('A PluginScope:', function () {
  var factoriesRegistry, plugins;
  beforeEach(function () {
    doubles.stubFeedsModule(feeds);
    doubles.stubRegistryModule(registry);
    factoriesRegistry = doubles.makeRegistry();
    registry.factoriesRegistry.returns(factoriesRegistry);

    plugins = pluginsModule.scope();
  });

  afterEach(function () {
    feeds.restoreOriginal();
    registry.restoreOriginal();
  });

  it("has a registerPlugin function", function () {
    expect(plugins.registerPlugin).to.be.a('function');
  });

  describe("given a plugin has been registered,", function () {
    var name, plugin, options;
    beforeEach(function () {
      name = 'some plugin';
      options = ['x', 'y', 'z'];
      plugin = doubles.stubFunction();

      plugins.registerPlugin(name, plugin);
    });

    describe("feedFactoryForPlugin():", function () {
      it('given the factory has been registered before, it will return the function returned by the factories registry', function () {
        var aFactory = doubles.stubFunction();
        factoriesRegistry.factoryFor.returns(aFactory);

        var result = plugins.feedFactoryForPlugin(name);

        expect(factoriesRegistry.factoryFor.calledOnce).to.be.ok();
        expect(factoriesRegistry.factoryFor.calledWithExactly(name)).to.be.ok();
        expect(result).to.be(aFactory);
      });

      it('when called with the plugin name, will return a function', function () {
        expect(plugins.feedFactoryForPlugin(name)).to.be.a('function');
      });

      describe("the returned feed factory function, when called with a bus factory and some options", function () {
        var makeBus, options, aFeed, makeState, expectedResultingFeed;
        beforeEach(function () {
          expectedResultingFeed = doubles.double(['chain']);
          feeds.feed.returns(expectedResultingFeed);
          makeBus = doubles.stubFunction();
          makeState = doubles.stubFunction();
          options = ['a', 'b', 'c'];

          sinon.stub(plugins, 'stateFactory');
          plugins.stateFactory.returns(makeState);
          factoriesRegistry.decorateWithPlugins.returns(expectedResultingFeed);

          aFeed = plugins.feedFactoryForPlugin(name)(makeBus, options);
        });

        afterEach(function () {
          plugins.stateFactory.restore();
        });

        it("will ask stateFactory() with the options and the plugin name to create a state factory", function () {
          expect(plugins.stateFactory.calledOnce).to.be.ok();
          expect(plugins.stateFactory.calledWithExactly(name, options)).to.be.ok();
        });

        it("will call the feeds module with the bus factory and the state factory to create a feed", function () {
          expect(feeds.feed.calledOnce).to.be.ok();
          expect(feeds.feed.calledWithExactly(makeBus, makeState)).to.be.ok();
        });

        it("will return the resulting feed", function () {
          expect(aFeed).to.be(expectedResultingFeed);
        });

        it("the result will be decorated with plugins", function () {
          expect(factoriesRegistry.decorateWithPlugins.calledOnce).to.be.ok();
          expect(factoriesRegistry.decorateWithPlugins.calledWithExactly(aFeed, makeBus)).to.be.ok();
        });
      });
    });

    describe("stateFactory()", function () {
      it("when called with the plugin names and some options, it will return a function", function () {
        expect(plugins.stateFactory(name, options)).to.be.a('function');
      });

      it("when called with a non existent plugin name, it will return undefined", function () {
        expect(plugins.stateFactory('not exists', options)).to.be(undefined);
      });

      describe("given it has been called with the plugin name and some options, the returned function will", function () {
        var factory, output, expectedResult, result;

        beforeEach(function () {
          output = 'original state output';
          expectedResult = {};
          plugin.returns(expectedResult);

          factory = plugins.stateFactory(name, options);

          result = factory(output);
        });

        it("call the specified plugin once", function () {
          expect(plugin.calledOnce).to.be.ok();
        });

        it("return the result of the plugin", function () {
          expect(result).to.be(expectedResult);
        });

        it("call the plugin with 3 arguments", function () {
          expect(plugin.lastCall.args.length).to.be(3);
        });

        it("call the plugin with the output as 1st argument", function () {
          expect(plugin.lastCall.args[0]).to.be(output);
        });

        it("call the plugin with a function as 2nd argument", function () {
          expect(plugin.lastCall.args[1]).to.be.a('function');
        });

        it("call the plugin with the options as 3rd argument", function () {
          expect(plugin.lastCall.args[2]).to.be(options);
        });
      });

      describe("the 2nd argument passed to the plugin, when called from the resulting state factory, is another state factory with its output binded to the original one:", function () {
        var factoryBindedToOutput, originalOutput;
        beforeEach(function () {
          originalOutput = 'original state output';
          plugins.stateFactory(name, options)(originalOutput);

          factoryBindedToOutput = plugin.lastCall.args[1];
        });

        describe("given it has been called with an existing plugin and some options, it will", function () {
          var anotherState, anotherResult, newOptions;
          beforeEach(function () {
            newOptions = ['x', 'c'];
            anotherState = 'another state';

            plugin.reset();
            plugin.returns(anotherState);

            anotherResult = factoryBindedToOutput(name, newOptions);
          });

          it("call the specified plugin once", function () {
            expect(plugin.calledOnce).to.be.ok();
          });

          it("return the result of the plugin", function () {
            expect(anotherResult).to.be(anotherState);
          });

          it("call the plugin with 3 arguments", function () {
            expect(plugin.lastCall.args.length).to.be(3);
          });

          it("call the plugin with the original state output as first argument", function () {
            expect(plugin.lastCall.args[0]).to.be(originalOutput);
          });

          it("call the plugin with the state factory itself as 2nd argument", function () {
            expect(plugin.lastCall.args[1]).to.be(factoryBindedToOutput);
          });

          it("call the plugin with the options as 3rd argument", function () {
            expect(plugin.lastCall.args[2]).to.be(newOptions);
          });
        });
      });
    });
  });
});