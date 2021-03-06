"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    busModule = require('../../../lib/internal/bus');

describe('A Bus:', function () {
  var bus, publicationFactory, publish;

  beforeEach(function () {
    publicationFactory = doubles.stubFunction();

    bus = new busModule.makeBus(publicationFactory);

    publish = bus.publish;
  });

  it('it has a subscribe() method', function () {
    expect(bus.subscribe).to.be.a('function');
  });

  it('subscribe() will return truthy if the subscriber has been subscribed before', function () {
    var subscriber = {};

    expect(bus.subscribe(subscriber)).not.to.be.ok();
    expect(bus.subscribe(subscriber)).to.be.ok();
    expect(bus.subscribe(subscriber)).to.be.ok();
  });

  it('it has a publish() method', function () {
    expect(bus.publish).to.be.a('function');
  });

  describe("publish(), event without runtime context:", function () {
    var event, data, result, publication;
    beforeEach(function () {
      event = 'x';
      data = 'args';
      publication = doubles.stubFunction();

      publicationFactory.returns(publication);

      result = publish(event, data);
    });

    it('call the the publication factory with the same parameters', function () {
      expect(publicationFactory.calledOnce).to.be.ok();
      expect(publicationFactory.calledWithExactly(event, data)).to.be.ok();
    });

    it('return the publication created by the publication factory', function () {
      expect(result).to.be(publication);
    });
  });

  describe('will notify each publication to its subscribers once:', function () {
    describe('given several objects has been subscribed to it', function () {
      var subscriber1, subscriber2, data;

      beforeEach(function () {
        data = 'passed data';

        subscriber1 = {};
        subscriber2 = {};

        bus.subscribe(subscriber1);
        bus.subscribe(subscriber2);
      });

      describe('when publishing an event, it', function () {
        var publication;

        beforeEach(function () {
          publication = doubles.stubFunction();
          publicationFactory.returns(publication);

          publish('some event', 'some data');
        });

        it('will call the publication() on all subscriptors exactly one time', function () {
          expect(publication.calledTwice).to.be.ok();
          expect(publication.firstCall.calledWith(subscriber1)).to.be.ok();
          expect(publication.secondCall.calledWith(subscriber2)).to.be.ok();
        });
      });
    });

    describe('given the same object has beed subscribed several times', function () {
      var subscriber, publication;
      beforeEach(function () {
        subscriber = {};

        bus.subscribe(subscriber);
        bus.subscribe(subscriber);
        bus.subscribe(subscriber);

        publication = doubles.stubFunction();
        publicationFactory.returns(publication);

        publish('an event', 'data');
      });

      it('when publishing an event, it will still make the publication only once', function () {
        expect(publication.calledOnce).to.be.ok();
        expect(publication.firstCall.calledWith(subscriber)).to.be.ok();
      });
    });
  });

  describe("will not remember past publications, and won't notify them to new subscribers", function () {
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
          publicationFactory.withArgs(ev.type, ev.data).returns(doubles.stubFunction());
        });

        events.forEach(function (ev) {
          publications.push(publish(ev.type, ev.data));
        });
      });

      it("when a new object is subscribed, it won't be notified about the past events", function () {
        var subscriber = {};

        bus.subscribe(subscriber);

        expect(publications[0].called).not.to.be.ok();
        expect(publications[1].called).not.to.be.ok();
        expect(publications[2].called).not.to.be.ok();
      });
    });
  });
});