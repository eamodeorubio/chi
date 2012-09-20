"use strict";

var expect = require('expect.js'),
    doubles = require('./helpers/doubles'),
    busModule = require('../lib/internal/bus'),
    feeds = require('../lib/internal/feeds'),
    chi = require('../lib/chi');

describe('The module chi:', function () {
  var expectedResult, expectedBus, expectedInitialState;

  beforeEach(function () {
    expectedResult = 'expected result';
    expectedBus = doubles.makeBus();
    expectedInitialState = 'expected initial state';

    doubles.stubBusModule(busModule);
    doubles.stubFeedsModule(feeds);

    busModule.EventBus.returns(expectedBus);
    feeds.yieldingState.returns(expectedInitialState);
    feeds.feed.returns(expectedResult);
  });

  afterEach(function () {
    busModule.restoreOriginal();
    feeds.restoreOriginal();
  });

  it('emitter() will return a feed with a default event bus, and a yielding state that *fires* yield events', function () {
    var result = chi.emitter();

    expect(busModule.EventBus.calledOnce).to.be.ok();
    expect(busModule.EventBus.calledWithNew()).to.be.ok();

    expect(feeds.yieldingState.calledOnce).to.be.ok();
    expect(feeds.yieldingState.calledWithExactly(expectedBus, 'fire')).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(expectedBus, expectedInitialState)).to.be.ok();

    expect(result).to.be(expectedResult);
  });

  it('list() will return a feed with a default event bus, an a yielding state that *publishes* yield events', function () {
    var result = chi.list();

    expect(busModule.EventBus.calledOnce).to.be.ok();
    expect(busModule.EventBus.calledWithNew()).to.be.ok();

    expect(feeds.yieldingState.calledOnce).to.be.ok();
    expect(feeds.yieldingState.calledWithExactly(expectedBus, 'publish')).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(expectedBus, expectedInitialState)).to.be.ok();

    expect(result).to.be(expectedResult);
  });
});