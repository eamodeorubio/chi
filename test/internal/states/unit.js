"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    unit = require('../../../lib/internal/states/unit');

describe('The internal/plugins/unit module:', function () {
  var chi;
  beforeEach(function () {
    chi = doubles.double(['registerPlugin']);
  });

  it("exports a function that register an 'unit' plugin", function () {
    unit(chi);

    expect(chi.registerPlugin.calledOnce).to.be.ok();
    expect(chi.registerPlugin.lastCall.args.length).to.be(2);
    expect(chi.registerPlugin.lastCall.args[0]).to.be('unit');
    expect(chi.registerPlugin.lastCall.args[1]).to.be.a('function');
  });

  describe("the registered plugin will create an object that", function () {
    var output, factory, anUnit;
    beforeEach(function () {
      unit(chi);

      var unitPlugin = chi.registerPlugin.lastCall.args[1];
      output = doubles.stubFunction();
      factory = doubles.stubFunction();

      anUnit = unitPlugin(output, factory);
    });

    describe('can process "yield" events:', function () {
      it('it has a yield() method', function () {
        expect(anUnit.yields).to.be.a('function');
      });

      describe('when yield is invoked with some data, it', function () {
        var result, data;

        beforeEach(function () {
          data = "some data";

          result = anUnit.yields(data);
        });

        it('will return the state itself', function () {
          expect(result).to.be(anUnit);
        });

        it('will publish exactly once the "yield" event on the bus with the data', function () {
          expect(output.calledOnce).to.be.ok();
          expect(output.calledWithExactly('yield', data)).to.be.ok();
        });
      });
    });

    describe('can process "throw" events:', function () {
      it('it has a throw() method', function () {
        expect(anUnit.throws).to.be.a('function');
      });

      describe('when throw is invoked with an error, it', function () {
        var result, error, aFailed;

        beforeEach(function () {
          error = "some error";
          aFailed = {};
          factory.returns(aFailed);

          result = anUnit.throws(error);
        });

        it('will return a "failed" with the thrown error', function () {
          expect(factory.calledOnce).to.be.ok();
          expect(factory.calledWithExactly('failed', [error])).to.be.ok();

          expect(result).to.be(aFailed);
        });

        it('publish exactly once the "throw" event on the bus with the throwed error', function () {
          expect(output.calledOnce).to.be.ok();
          expect(output.calledWithExactly('throw', error)).to.be.ok();
        });
      });
    });

    describe('can process "done" events:', function () {
      it('it has a done() method', function () {
        expect(anUnit.done).to.be.a('function');
      });

      describe('when done is invoked, it', function () {
        var result, aSuccess;

        beforeEach(function () {
          aSuccess = {};
          factory.returns(aSuccess);

          result = anUnit.done();
        });

        it('will return a "success"', function () {
          expect(factory.calledOnce).to.be.ok();
          expect(factory.calledWithExactly('success')).to.be.ok();

          expect(result).to.be(aSuccess);
        });

        it('publish exactly once the "done" event on the bus', function () {
          expect(output.calledOnce).to.be.ok();
          expect(output.calledWithExactly('done')).to.be.ok();
        });
      });
    });
  });
});