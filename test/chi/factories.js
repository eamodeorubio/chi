"use strict";

var expect = require('expect.js'),
    doubles = require('./../helpers/doubles'),
    chi = require('../../lib/chi').make();

describe('A Chi has the following predefined factories:', function () {
  var expectedResult;

  beforeEach(function () {
    expectedResult = 'expected result';
    chi.unit = doubles.stubFunction();
    chi.unit.returns(expectedResult);
  });

  it('emitter() will return an "unit" feed without memory', function () {
    var result = chi.emitter();

    expect(chi.unit.calledOnce).to.be.ok();
    expect(chi.unit.calledWithExactly(false)).to.be.ok();

    expect(result).to.be(expectedResult);
  });

  it('list() will return an "unit" feed with memory', function () {
    var result = chi.list();

    expect(chi.unit.calledOnce).to.be.ok();
    expect(chi.unit.calledWithExactly(true)).to.be.ok();

    expect(result).to.be(expectedResult);
  });
});