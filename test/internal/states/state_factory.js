"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    registry = require('../../../lib/internal/states/state_factory');

describe('The module internal/plugins/state_factory:', function () {
  it("exports a stateFactory function", function () {
    expect(registry.stateFactory).to.be.a('function');
  });

  describe("Given a state factory has been constructed using the exported function", function () {
    var aRegistry;
    beforeEach(function () {
      aRegistry = registry.stateFactory();
    });

    it("it has a registerPlugin function", function () {
      expect(aRegistry.registerPlugin).to.be.a('function');
    });

    describe("given a plugin has been registered,", function () {
      var name, plugin;
      beforeEach(function () {
        name = 'some plugin';

        plugin = doubles.stubFunction();

        aRegistry.registerPlugin(name, plugin);
      });

      describe('makeStateFor():', function () {
        var options, emit;
        beforeEach(function () {
          options = ['x', 'y', 'z'];
          emit = 'some emitter';
        });

        it("when called with a non existent plugin name, it will return undefined", function () {
          expect(aRegistry.makeStateFor('not exists', emit, options)).to.be(undefined);
        });

        describe('when called with an existing plugin name and some emitter and options, it will', function () {
          var result, expectedResult;

          beforeEach(function () {
            expectedResult = {};
            plugin.returns(expectedResult);

            result = aRegistry.makeStateFor(name, emit, options);
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

          it("call the plugin with the emitter as 1st argument", function () {
            expect(plugin.lastCall.args[0]).to.be(emit);
          });

          it("call the plugin with a function as 2nd argument", function () {
            expect(plugin.lastCall.args[1]).to.be.a('function');
          });

          it("call the plugin with the options as 3rd argument", function () {
            expect(plugin.lastCall.args[2]).to.be(options);
          });

          describe('the function passed as 2nd argument to the plugin is another state factory with its emitter binded to the original one', function () {
            var factoryBindedToEmitter;
            beforeEach(function () {
              factoryBindedToEmitter = plugin.lastCall.args[1];
            });

            describe("it will", function () {
              var anotherState, anotherResult, newOptions;
              beforeEach(function () {
                newOptions = ['x', 'c'];
                anotherState = 'another state';

                plugin.reset();
                plugin.returns(anotherState);

                anotherResult = factoryBindedToEmitter(name, newOptions);
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

              it("call the plugin with the original emitter as first argument", function () {
                expect(plugin.lastCall.args[0]).to.be(emit);
              });

              it("call the plugin with the state factory itself as 2nd argument", function () {
                expect(plugin.lastCall.args[1]).to.be(factoryBindedToEmitter);
              });

              it("call the plugin with the options as 3rd argument", function () {
                expect(plugin.lastCall.args[2]).to.be(newOptions);
              });
            });
          });
        });
      });
    });
  });
});