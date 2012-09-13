"use strict";

var expect = require('expect.js'),
    chi = require('../../lib/chi.js');

describe('An Emitter', function () {
  var anEmmitter;

  beforeEach(function () {
    anEmmitter = chi.emitter();
  });

  describe('can yield values', function () {
    it('has a yield() method', function () {
      expect(anEmmitter.yield).to.be.a('function');
    });

    describe('given it is piped to several outputs', function () {
      var output1, output2, output3;

      beforeEach(function () {
        output1 = {};
        output2 = {};
        output3 = {};

        anEmmitter.pipe(output1);
        anEmmitter.pipe(output2);
        anEmmitter.pipe(output3);
      });

      describe('when yield is invoked with a value', function () {
        var value = "yielded value";

        beforeEach(function () {
          anEmmitter.yield(value);
        });

        it('will call yield on all piped outputs');
        it('will pass the same argument to all piped outputs');
      });
    });
  });
});