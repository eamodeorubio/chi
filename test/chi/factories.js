"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    feeds = require('../../lib/internal/feeds'),
    chi = require('../../lib/chi');

describe('The module chi has the following factories:', function () {
  var expectedResult, expectedInitialState;

  beforeEach(function () {
    expectedResult = 'expected result';
    expectedInitialState = 'expected initial state';

    doubles.stubBusModule(busModule);
    doubles.stubFeedsModule(feeds);

    feeds.yieldingState.returns(expectedInitialState);
    feeds.feed.returns(expectedResult);
  });

  afterEach(function () {
    busModule.restoreOriginal();
    feeds.restoreOriginal();
  });

  it('emitter() will return a feed with an event emitter and a yielding state built with that emitter', function () {
    var emitter = doubles.makeBus();
    busModule.emitter.returns(emitter);

    var result = chi.emitter();

    expect(busModule.emitter.calledOnce).to.be.ok();

    expect(feeds.yieldingState.calledOnce).to.be.ok();
    expect(feeds.yieldingState.calledWithExactly(emitter)).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(emitter, expectedInitialState)).to.be.ok();

    expect(result).to.be(expectedResult);
  });

  it('list() will return a feed with an event storage and a yielding state built with that storage', function () {
    var storage = doubles.makeBus();
    busModule.storage.returns(storage);

    var result = chi.list();

    expect(busModule.storage.calledOnce).to.be.ok();

    expect(feeds.yieldingState.calledOnce).to.be.ok();
    expect(feeds.yieldingState.calledWithExactly(storage)).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(storage, expectedInitialState)).to.be.ok();

    expect(result).to.be(expectedResult);
  });
});