"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    feeds = require('../../../lib/internal/feeds');

describe("The module internal/feeds can be extended with plugins:", function () {
  it("has a registerPlugin function", function () {
    expect(feeds.registerPlugin).to.be.a('function');
  });

  describe("given registerPlugin() has been called with a name and a function,", function () {
    var name, plugin;
    beforeEach(function () {
      name = "plugme";
      plugin = doubles.stubFunction();

      feeds.registerPlugin(name, plugin);
    });

    describe("when a feed is created:", function () {
      var newFeed, busFactory, stateFactory;
      beforeEach(function () {
        var bus = doubles.makeBus();
        busFactory = doubles.stubFunction();
        busFactory.returns(bus);

        var initialState = doubles.makeFeedState();
        stateFactory = doubles.stubFunction();
        stateFactory.returns(initialState);

        newFeed = feeds.feed(busFactory, stateFactory);
      });

      it("it will have a method with the same name that the plugin", function () {
        expect(newFeed[name]).to.be.a('function');
      });

      describe("when the pluged method is invoked with some arguments,", function () {
        var newBus, arg1, arg2;
        beforeEach(function () {
          arg1 = "arg1";
          arg2 = "arg2";

          newBus = doubles.makeBus();
          busFactory.returns(newBus);

          newFeed[name](arg1, arg2);
        });

        it("will call the busFactory to create a new bus", function () {
          expect(busFactory.calledTwice).to.be.ok();
        });
      });
    });
  });
});