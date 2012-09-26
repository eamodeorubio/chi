"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    busModule = require('../../../lib/internal/bus');

describe('An EventStorage,', function () {
  var storage, emitter;

  beforeEach(function () {
    emitter = doubles.makeBus();

    storage = new busModule.storage(emitter);
  });

  describe('will delegate subscribtion to the emitter:', function () {
    it('it has a subscribe() method', function () {
      expect(storage.subscribe).to.be.a('function');
    });

    it('subscribe() will call the the subscribe method of the emitter with the same subscriber', function () {
      var subscriber = {};

      storage.subscribe(subscriber);

      expect(emitter.subscribe.calledOnce).to.be.ok();
      expect(emitter.subscribe.calledOn(emitter)).to.be.ok();
      expect(emitter.subscribe.calledWithExactly(subscriber)).to.be.ok();
    });

    it('subscribe() will return the result of emitter.subscribe()', function () {
      var subscriber = {}, expectedResult = 'expected result';

      emitter.subscribe.returns(expectedResult);

      expect(storage.subscribe(subscriber)).to.be(expectedResult);
    });
  });

  describe('will delegate publication to the emitter:', function () {
    it('it has a publish() method', function () {
      expect(storage.publish).to.be.a('function');
    });

    describe("publish() will", function () {
      var event, data, result, publication;
      beforeEach(function () {
        event = 'event type';
        data = 'event data';
        publication = doubles.stubFunction();
        emitter.publish.returns(publication);

        result = storage.publish(event, data);
      });

      it('call the the publish method of the emitter with the same parameters', function () {
        expect(emitter.publish.calledOnce).to.be.ok();
        expect(emitter.publish.calledOn(emitter)).to.be.ok();
        expect(emitter.publish.calledWithExactly(event, data)).to.be.ok();
      });

      it('return the publication returned by the emitter', function () {
        expect(result).to.be(publication);
      });
    });
  });

  describe('remembers past publications and will notify them to new subscribers', function () {
    describe('given that several events has been published,', function () {
      var publications;
      beforeEach(function () {
        var events = [
          {
            type:'a', data:22
          },
          {
            type:'b', data:'asdad'
          },
          {
            type:'a', data:2
          }
        ];

        publications = [];

        events.forEach(function (ev) {
          emitter.publish.withArgs(ev.type, ev.data).returns(doubles.stubFunction());
        });

        events.forEach(function (ev) {
          publications.push(storage.publish(ev.type, ev.data));
        });
      });

      describe('when a new object is subscribed,', function () {
        var subscriber;
        beforeEach(function () {
          subscriber = {};
          emitter.subscribe.returns(true);

          storage.subscribe(subscriber);
        });

        it('it will be notified of all prior publications', function () {
          expect(publications[0].calledOnce).to.be.ok();
          expect(publications[0].calledWithExactly(subscriber)).to.be.ok();
          expect(publications[1].calledOnce).to.be.ok();
          expect(publications[1].calledWithExactly(subscriber)).to.be.ok();
          expect(publications[2].calledOnce).to.be.ok();
          expect(publications[2].calledWithExactly(subscriber)).to.be.ok();
        });

        it('it will be notified in order of publication', function () {
          expect(publications[0].calledBefore(publications[1])).to.be.ok();
          expect(publications[1].calledBefore(publications[2])).to.be.ok();
        });
      });

      it("if it is a duplicated subscriber won't be not notified again", function () {
        var subscriber = {};
        emitter.subscribe.returns(false);

        storage.subscribe(subscriber);

        expect(publications[0].called).not.to.be.ok();
        expect(publications[1].called).not.to.be.ok();
        expect(publications[2].called).not.to.be.ok();
      });
    });
  });
});