"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    chi = require('../../lib/chi');

describe('An Emitter', function () {
  var anEmmitter;

  beforeEach(function () {
    anEmmitter = chi.emitter();
  });

  describe('can yield values', function () {
    it('has a yield() method', function () {
      expect(anEmmitter.yield).to.be.a('function');
    });

    describe('given it is chained to several feeds', function () {
      var output1, output2, output3;

      beforeEach(function () {
        output1 = doubles.makeFeed();
        output2 = doubles.makeFeed();
        output3 = doubles.makeFeed();

        anEmmitter.chain(output1);
        anEmmitter.chain(output2);
        anEmmitter.chain(output3);
      });

      describe('when yield is invoked with a value, it', function () {
        var value = "yielded value";

        beforeEach(function () {
          anEmmitter.yield(value);
        });

        it('will call yield on all chained feeds exactly one time', function () {
          expect(output1.yield.calledOnce).to.be.ok();
          expect(output2.yield.calledOnce).to.be.ok();
          expect(output3.yield.calledOnce).to.be.ok();
        });

        it('will pass the same argument to all chained feeds');
      });
    });
  });
});