"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    busModule = require('../../../lib/internal/bus');

function aPublicationOfEvent(event) {
  describe("A publication, of event '" + event + "' with data 'args':", function () {
    var data, publication;

    beforeEach(function () {
      data = 'args';

      publication = new busModule.publication(event, data);
    });

    it('is a function', function () {
      expect(publication).to.be.a('function');
    });

    it("will notify the event 'x' with the data 'args' to the listener passed as argument", function () {
      var listener = doubles.double([event, 'not' + event]);

      publication(listener);

      expect(listener[event].calledOnce).to.be.ok();
      expect(listener[event].calledOn(listener)).to.be.ok();
      expect(listener[event].calledWithExactly(data)).to.be.ok();
      expect(listener['not' + event].called).not.to.be.ok();
    });

    describe("it is bulletproof: won't fail even if", function () {
      it("the listener is null", function () {
        expect(function () {
          publication(null);
        }).not.to.throwError();
      });

      it("there is no listener", function () {
        expect(function () {
          publication();
        }).not.to.throwError();
      });

      it("the listener cannot receive the event", function () {
        expect(function () {
          publication(doubles.double(['z']));
        }).not.to.throwError();
      });

      it("the listener throws", function () {
        var listener = doubles.double([event]);
        listener[event].throws('very bad error');

        expect(function () {
          publication(listener);
        }).not.to.throwError();
      });
    });
  });
}

['X', 'Y', 'Z'].forEach(aPublicationOfEvent);