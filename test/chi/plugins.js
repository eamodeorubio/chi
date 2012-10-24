"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    feedFactoryModule = require('../../lib/internal/feeds/feed_factory.js'),
    chiModule = require('../../lib/chi');

describe("A chi instance can be extended with plugins:", function () {
  var chi, feedFactory;
  beforeEach(function () {
    feedFactory = doubles.makeFeedFactory();

    doubles.stubObject(busModule);
    doubles.stubObject(feedFactoryModule);
    feedFactoryModule.feedFactory.returns(feedFactory);

    chi = chiModule.make();
  });

  afterEach(function () {
    feedFactoryModule.restoreOriginal();
    busModule.restoreOriginal();
  });

  it("has a registerPlugin function", function () {
    expect(chi.registerPlugin).to.be.a('function');
  });

  describe("registerPlugin will throw if:", function () {
    describe("the 'name' parameter is not valid:", function () {
      function checkThrows(name) {
        expect(function () {
          chi.registerPlugin(name, doubles.stubFunction());
        }).to.throwError();
      }

      it('an empty string is not valid', function () {
        checkThrows('');
      });

      it('undefined is not valid', function () {
        checkThrows();
      });

      it('null is not valid', function () {
        checkThrows(null);
      });

      it('a number is not valid', function () {
        checkThrows(10);
      });

      it('a boolean is not valid', function () {
        checkThrows(true);
      });

      it('a function is not valid', function () {
        checkThrows(function () {
        });
      });

      it('an object is not valid', function () {
        checkThrows({});
      });
    });

    describe("the 'plugin' parameter is not valid:", function () {
      function checkThrows(plugin) {
        expect(function () {
          chi.registerPlugin('xx', plugin);
        }).to.throwError();
      }

      it('a string string is not valid', function () {
        checkThrows('yy');
      });

      it('undefined is not valid', function () {
        checkThrows();
      });

      it('null is not valid', function () {
        checkThrows(null);
      });

      it('a number is not valid', function () {
        checkThrows(10);
      });

      it('a boolean is not valid', function () {
        checkThrows(true);
      });

      it('an object is not valid', function () {
        checkThrows({});
      });
    });

    it("feedFactory.registerPlugin() throws", function () {
      var name = 'xx', error = 'duplicated error', plugin = doubles.stubFunction();

      feedFactory.registerPlugin.throws(error);

      expect(function () {
        chi.registerPlugin(name, plugin);
      }).to
          .throwException(function (e) {
            console.log(e);
            expect(e).to.contain(name);
            expect(e).to.contain(': ' + error);
          });
    });
  });
  describe("given registerPlugin() has been called with a name and a function, it", function () {
    var name, plugin, bus, busWithMemory;
    beforeEach(function () {
      name = "plugme";
      bus = 'an emitter bus';
      busWithMemory = 'an storage bus';
      plugin = doubles.stubFunction();

      busModule.makeBus.returns(bus);
      busModule.makeBusWithMemory.returns(busWithMemory);

      chi.registerPlugin(name, plugin);
    });

    it("will register the plugin in the feed factory", function () {
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

        expect(busModule.makeBus.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, bus, [])).to.be.ok();
      });

      it("with false as a parameter, it will create a feed with an emitter and a state factory created with the plugin name and an empty array", function () {
        chi[name](false);

        expect(busModule.makeBus.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, bus, [])).to.be.ok();
      });

      it("with true as a parameter, it will create a feed with a storage and a state factory created with the plugin name and an empty array", function () {
        chi[name](true);

        expect(busModule.makeBusWithMemory.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, busWithMemory, [])).to.be.ok();
      });

      it("with true and more parameters, it will create a feed with a storage and a state factory created with the plugin name and an array with the extra parameters", function () {
        chi[name](true, '', 0);

        expect(busModule.makeBusWithMemory.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, busWithMemory, ['', 0])).to.be.ok();
      });

      it("with a first argument that is not a boolean, it will create a feed with an emitter and a state factory created with the plugin name and an array with all parameters", function () {
        chi[name](1);

        expect(busModule.makeBus.calledOnce).to.be.ok();
        expect(feedFactory.makeFeedFor.calledWithExactly(name, bus, [1])).to.be.ok();
      });
    });
  });
});