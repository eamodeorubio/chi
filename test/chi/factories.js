"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    busModule = require('../../lib/internal/bus'),
    states = require('../../lib/internal/states'),
    feeds = require('../../lib/internal/feeds'),
    chi = require('../../lib/chi');

describe('The module chi has the following factories:', function () {
  var expectedResult, expectedInitialState;

  beforeEach(function () {
    expectedResult = 'expected result';

    doubles.stubFeedsModule(feeds);
    doubles.stubStatesModule(states);

    feeds.feed.returns(expectedResult);
  });

  afterEach(function () {
    feeds.restoreOriginal();
    states.restoreOriginal();
  });

  it('emitter() will return a feed with an event emitter and a yielding state built with that emitter', function () {
    var stateFactory = doubles.stubFunction();
    states.stateFactory.returns(stateFactory);

    var result = chi.emitter();

    expect(states.stateFactory.calledOnce).to.be.ok();
    expect(states.stateFactory.calledWithExactly('unit')).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(busModule.emitter, stateFactory)).to.be.ok();

    expect(result).to.be(expectedResult);
  });

  it('list() will return a feed with an event storage and a yielding state built with that storage', function () {
    var stateFactory = doubles.stubFunction();
    states.stateFactory.returns(stateFactory);

    var result = chi.list();

    expect(states.stateFactory.calledOnce).to.be.ok();
    expect(states.stateFactory.calledWithExactly('unit')).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(busModule.storage, stateFactory)).to.be.ok();

    expect(result).to.be(expectedResult);
  });
});