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

      chi.registerPlugin(name, plugin);
    });

    it("then a factory method with the same name that the plugin will be available in chi", function () {
      expect(chi[name]).to.be.a('function');
    });

    describe("when the new factory method is called,", function () {
      var expectedBus, expectedResult;

      beforeEach(function () {
        expectedBus = doubles.makeBus();
        expectedResult = 'expected result';

        doubles.stubBusModule(busModule);
        doubles.stubFeedsModule(feeds);

        busModule.EventBus.returns(expectedBus);
        feeds.feed.returns(expectedResult);
      });

      afterEach(function () {
        busModule.restoreOriginal();
        feeds.restoreOriginal();
      });

      it("it will create a new bus", function () {
        chi[name]();

        expect(busModule.EventBus.calledOnce).to.be.ok();
        expect(busModule.EventBus.calledWithNew()).to.be.ok();
      });

      it("will return the feed built by the feeds module", function () {
        var result = chi[name]();

        expect(result).to.be(expectedResult);
      });
    });
  });
});