"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    success = require('../../../lib/internal/plugins/success');

describe('The internal/plugins/success module:', function () {
  var chi;
  beforeEach(function () {
    chi = doubles.double(['registerPlugin']);
  });

  it("exports a function that register a 'success' plugin", function () {
    success(chi);

    expect(chi.registerPlugin.calledOnce).to.be.ok();
    expect(chi.registerPlugin.lastCall.args.length).to.be(2);
    expect(chi.registerPlugin.lastCall.args[0]).to.be('success');
    expect(chi.registerPlugin.lastCall.args[1]).to.be.a('function');
  });

  describe("the registered plugin will create an object that", function () {
    var aSuccess;
    beforeEach(function () {
      success(chi);
      var successPlugin = chi.registerPlugin.lastCall.args[1];

      aSuccess = successPlugin();
    });

    function cannotDoAnymore(action) {
      describe('cannot process "' + action + '" event anymore:', function () {
        it('it has a ' + action + '() method', function () {
          expect(aSuccess[action]).to.be.a('function');
        });

        it(action + '() will throw', function () {
          expect(aSuccess[action]).to.throwError();
        });
      });
    }

    ['yields', 'throws'].forEach(cannotDoAnymore);

    describe('can process "done" events:', function () {
      it('it has a done() method', function () {
        expect(aSuccess.done).to.be.a('function');
      });

      it('when done is invoked, it only will return itself', function () {
        expect(aSuccess.done()).to.be(aSuccess);
      });
    });
  });
});