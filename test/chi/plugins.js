"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
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
      var expectedBus;

      beforeEach(function () {
        expectedBus = doubles.makeBus();

        doubles.stubBusModule(busModule);

        busModule.EventBus.returns(expectedBus);
      });

      afterEach(function () {
        busModule.restoreOriginal();
      });

      it("it will create a new bus", function () {
        chi[name]();

        expect(busModule.EventBus.calledOnce).to.be.ok();
        expect(busModule.EventBus.calledWithNew()).to.be.ok();
      });
    });
  });
});