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
      var newFeed, bus, state;
      beforeEach(function () {
        state = doubles.makeFeedState();
        bus = doubles.makeBus();

        newFeed = feeds.feed(bus, state);
      });

      it("it will have a method with the same name that the plugin", function () {
        expect(newFeed[name]).to.be.a('function');
      });
    });
  });
});