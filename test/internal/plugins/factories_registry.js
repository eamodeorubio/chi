"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    registry = require('../../../lib/internal/plugins/feed_factory_registry');

describe('The module internal/plugins/feed_factory_registry:', function () {
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
        var chainable, bus, returned;
        beforeEach(function () {
          chainable = doubles.double(['chain']);
          bus = 'a bus';

          returned = aRegistry.decorateWithPlugins(chainable, bus);
        });

        it('the returned value will be the chainable itself', function () {
          expect(returned).to.be(chainable);
        });

        it("the result will have a method with the same name that the plugin", function () {
          expect(chainable[name]).to.be.a('function');
        });

        describe("when the plugged method is invoked with some arguments,", function () {
          var arg1, arg2, aFeed, expectedResult, result;
          beforeEach(function () {
            aFeed = "created feed";
            expectedResult = "expected result";
            arg1 = "arg1";
            arg2 = "arg2";

            factory.returns(aFeed);
            chainable.chain.returns(expectedResult);

            result = chainable[name](arg1, arg2);
          });

          it("will ask the factory to create a new feed with the bus factory and the arguments", function () {
            expect(factory.calledOnce).to.be.ok();
            expect(factory.calledWithExactly(bus, [arg1, arg2])).to.be.ok();
          });

          it("will call chain on the chainable using with the feed created by the factory", function () {
            expect(chainable.chain.calledOnce).to.be.ok();
            expect(chainable.chain.calledOn(chainable)).to.be.ok();
            expect(chainable.chain.calledWithExactly(aFeed)).to.be.ok();
          });

          it("will return the result of chaining the feed with the chainable", function () {
            expect(result).to.be(expectedResult);
          });
        });
      });
    });
  });
});