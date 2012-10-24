"use strict";

var expect = require('expect.js'),
    doubles = require('../../../helpers/doubles'),
    registry = require('../../../../lib/internal/plugins/registry');

describe('The module internal/plugins/registry:', function () {
  it("exports a feedFactoriesRegistry function", function () {
    expect(registry.feedFactoriesRegistry).to.be.a('function');
  });

  describe("Given a registry has been constructed using the exported function", function () {
    var aRegistry;
    beforeEach(function () {
      aRegistry = registry.feedFactoriesRegistry();
    });

    it("it has a registerFactoryFor function", function () {
      expect(aRegistry.registerFactoryFor).to.be.a('function');
    });

    describe("given a factory has been registered,", function () {
      var name, factory, options;
      beforeEach(function () {
        name = 'some plugin';
        options = ['x', 'y', 'z'];
        factory = doubles.stubFunction();

        aRegistry.registerFactoryFor(name, factory);
      });

      it("factoryFor will return the asked factory", function () {
        expect(aRegistry.factoryFor(name)).to.be(factory);
      });

      describe("decorateWithPlugins when called with a chainable object and a bus factory:", function () {
        var aChainable, makeBus;
        beforeEach(function () {
          aChainable = doubles.double(['chain']);
          makeBus = doubles.stubFunction();

          aRegistry.decorateWithPlugins(aChainable, makeBus);
        });

        it("the result will have a method with the same name that the plugin", function () {
          expect(aChainable[name]).to.be.a('function');
        });

        describe("when the plugged method is invoked with some arguments,", function () {
          var arg1, arg2, aFeed, expectedResult, result;
          beforeEach(function () {
            aFeed = "created feed";
            expectedResult = "expected result";
            arg1 = "arg1";
            arg2 = "arg2";

            factory.returns(aFeed);
            aChainable.chain.returns(expectedResult);

            result = aChainable[name](arg1, arg2);
          });

          it("will ask the factory to create a new feed with the bus factory and the arguments", function () {
            expect(factory.calledOnce).to.be.ok();
            expect(factory.calledWithExactly(makeBus, [arg1, arg2])).to.be.ok();
          });

          it("will call chain on the chainable using with the feed created by the factory", function () {
            expect(aChainable.chain.calledOnce).to.be.ok();
            expect(aChainable.chain.calledOn(aChainable)).to.be.ok();
            expect(aChainable.chain.calledWithExactly(aFeed)).to.be.ok();
          });

          it("will return the result of chaining the feed with the chainable", function () {
            expect(result).to.be(expectedResult);
          });
        });
      });
    });
  });
});