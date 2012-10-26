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

    function canProcess(eventType) {
      describe('can process "' + eventType + '" events:', function () {
        it('it has a ' + eventType + '() method', function () {
          expect(anUnit[eventType]).to.be.a('function');
        });

        describe('when ' + eventType + ' is invoked with some data, it', function () {
          var result, data;

          beforeEach(function () {
            data = "some data";

            result = anUnit[eventType](data);
          });

          it('will return the state itself', function () {
            expect(result).to.be(anUnit);
          });

          it('will publish exactly once the "' + eventType + '" event on the bus with the data', function () {
            expect(output.calledOnce).to.be.ok();
            expect(output.calledWithExactly(eventType, data)).to.be.ok();
          });
        });
      });
    }

    ['yields', 'throws'].forEach(canProcess);

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