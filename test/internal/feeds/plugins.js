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

    describe("when a feed is created,", function () {
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
    });
  });
});