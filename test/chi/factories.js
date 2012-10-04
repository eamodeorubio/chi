"use strict";

var expect = require('expect.js'),
    sinon = require('sinon'),
    chi = require('../../lib/chi');

describe('The module chi has the following predefined factories:', function () {
  var expectedResult;

  beforeEach(function () {
    expectedResult = 'expected result';
    sinon.stub(chi, 'unit');
    chi.unit.returns(expectedResult);
  });

  afterEach(function () {
    chi.unit.restore();
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