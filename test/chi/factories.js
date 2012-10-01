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
    expectedInitialState = 'expected initial state';

    doubles.stubBusModule(busModule);
    doubles.stubFeedsModule(feeds);
    doubles.stubStatesModule(states);

    feeds.feed.returns(expectedResult);
  });

  afterEach(function () {
    busModule.restoreOriginal();
    feeds.restoreOriginal();
    states.restoreOriginal();
  });

  it('emitter() will return a feed with an event emitter and a yielding state built with that emitter', function () {
    var emitter = doubles.makeBus(), stateFactory = doubles.stubFunction();
    busModule.emitter.returns(emitter);
    stateFactory.returns(expectedInitialState);
    states.stateFactoryWith.returns(stateFactory);

    var result = chi.emitter();

    expect(busModule.emitter.calledOnce).to.be.ok();

    expect(states.stateFactoryWith.calledOnce).to.be.ok();
    expect(states.stateFactoryWith.calledWithExactly(emitter.publish)).to.be.ok();

    expect(stateFactory.calledOnce).to.be.ok();
    expect(stateFactory.calledWithExactly('unit')).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(emitter, expectedInitialState)).to.be.ok();

    expect(result).to.be(expectedResult);
  });

  it('list() will return a feed with an event storage and a yielding state built with that storage', function () {
    var storage = doubles.makeBus(), stateFactory = doubles.stubFunction();
    busModule.storage.returns(storage);
    stateFactory.returns(expectedInitialState);
    states.stateFactoryWith.returns(stateFactory);

    var result = chi.list();

    expect(busModule.storage.calledOnce).to.be.ok();

    expect(states.stateFactoryWith.calledOnce).to.be.ok();
    expect(states.stateFactoryWith.calledWithExactly(storage.publish)).to.be.ok();

    expect(stateFactory.calledOnce).to.be.ok();
    expect(stateFactory.calledWithExactly('unit')).to.be.ok();

    expect(feeds.feed.calledOnce).to.be.ok();
    expect(feeds.feed.calledWithExactly(storage, expectedInitialState)).to.be.ok();

    expect(result).to.be(expectedResult);
  });
});