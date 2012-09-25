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
});