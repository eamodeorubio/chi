"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    chi = require('../../lib/chi');

describe('An Emitter can be chained:', function () {
  var anEmitter;

  beforeEach(function () {
    anEmitter = chi.emitter();
  });

  it('it has a chain() method', function () {
    expect(anEmitter.chain).to.be.a('function');
  });

  describe('when chain is invoked with another feed, it will return', function () {
    var aFeed, chainResult;
    beforeEach(function () {
      aFeed = doubles.makeFeed();

      chainResult = anEmitter.chain(aFeed);
    });

    it('a non null object', function(){
      expect(chainResult).to.be.an('object');
      expect(chainResult).not.to.be(null);
    });
  });
});