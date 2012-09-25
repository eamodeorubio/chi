"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    feeds = require('../../lib/internal/feeds');

describe('The module internal/feeds can be extended with plugins:', function () {
  it("has a registerPlugin function", function () {
    expect(feeds.registerPlugin).to.be.a('function');
  });

  it("registerPlugin() will add the plugin of a member of feeds.plugins", function () {
    var name = 'plugin name', plugin = doubles.stubFunction();

    feeds.registerPlugin(name, plugin);

    expect(feeds.plugins).to.be.an('object');
    expect(feeds.plugins).not.to.be(null);
    expect(feeds.plugins[name]).to.be(plugin);
  });

  describe("given a plugin has been registered:", function () {
    var name, plugin;
    beforeEach(function () {
      name = 'some plugin';
      plugin = doubles.stubFunction();

      feeds.registerPlugin(name, plugin);
    });

    describe("initialStateFor will", function () {
      var bus, notificationType, options;
      beforeEach(function () {
        bus = doubles.makeBus();
        notificationType = 'xxx';
        options = ["a", "b", "c"];

        feeds.initialStateFor(name, bus, notificationType, options);
      });

      it("call the plugin only once", function () {
        expect(plugin.calledOnce).to.be.ok();
      });

      it("will call the plugin with 3 arguments: an non null object, a function and the plugin options", function () {
        expect(plugin.lastCall.args.length).to.be(3);
        expect(plugin.lastCall.args[0]).to.be.an('object');
        expect(plugin.lastCall.args[0]).not.to.be(null);
        expect(plugin.lastCall.args[1]).to.be.a('function');
        expect(plugin.lastCall.args[2]).to.be(options);
      });
    });
  });
});