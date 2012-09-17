"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    utils = require('../../lib/internal/utils'),
    chi = require('../../lib/chi');

describe('An Emitter can yield values:', function () {
  var anEmmitter, value = "yielded value", aBus, originalEventBus;

  beforeEach(function () {
    aBus = doubles.makeBus();
    originalEventBus = utils.EventBus;
    utils.EventBus = function () {
      return aBus;
    };

    anEmmitter = chi.emitter();
  });

  afterEach(function () {
    utils.EventBus = originalEventBus;
  });

  it('it has a yield() method', function () {
    expect(anEmmitter.yield).to.be.a('function');
  });

  describe('when yield is invoked with a value, it', function () {
    var result;

    beforeEach(function () {
      result = anEmmitter.yield(value);
    });

    it('will return itself', function () {
      expect(result).to.be(anEmmitter);
    });

    it('will call publishYield on the bus with the yielded value', function () {
      expect(aBus.publishYield.calledOnce).to.be.ok();
      expect(aBus.publishYield.calledOn(aBus)).to.be.ok();
      expect(aBus.publishYield.calledWithExactly(value)).to.be.ok();
    });
  });
});