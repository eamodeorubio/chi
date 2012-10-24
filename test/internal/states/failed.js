"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    failed = require('../../../lib/internal/states/failed');

describe('The internal/plugins/failed module:', function () {
  var chi;
  beforeEach(function () {
    chi = doubles.double(['registerPlugin']);
  });

  it("exports a function that register a 'failed' plugin", function () {
    failed(chi);

    expect(chi.registerPlugin.calledOnce).to.be.ok();
    expect(chi.registerPlugin.lastCall.args.length).to.be(2);
    expect(chi.registerPlugin.lastCall.args[0]).to.be('failed');
    expect(chi.registerPlugin.lastCall.args[1]).to.be.a('function');
  });

  describe("the registered plugin will create an object that", function () {
    var aFailed, error;
    beforeEach(function () {
      failed(chi);
      var failedPlugin = chi.registerPlugin.lastCall.args[1];
      error = 'some error';

      aFailed = failedPlugin('not used', 'not used', [error]);
    });

    function cannotDoAnymore(action) {
      describe('cannot process "' + action + '" events anymore:', function () {
        it('it has a ' + action + '() method', function () {
          expect(aFailed[action]).to.be.a('function');
        });

        it(action + '() will throw', function () {
          expect(aFailed[action]).to.throwError();
        });
      });
    }

    ['yields', 'throws', 'done'].forEach(cannotDoAnymore);

    it('when throw is invoked with the same error, it only will return itself', function () {
      expect(aFailed.throws(error)).to.be(aFailed);
    });
  });
});