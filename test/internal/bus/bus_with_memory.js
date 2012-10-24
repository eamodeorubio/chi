"use strict";

var expect = require('expect.js'),
    doubles = require('../../helpers/doubles'),
    busModule = require('../../../lib/internal/bus');

describe('An BusWithMemory:', function () {
  var bus, delegate, publish;

  beforeEach(function () {
    delegate = doubles.makeBus();

    bus = new busModule.makeBusWithMemory(delegate);

    publish = bus.publish;
  });

  describe('will delegate subscriptions:', function () {
    it('it has a subscribe() method', function () {
      expect(bus.subscribe).to.be.a('function');
    });

    it('subscribe() will call the the subscribe method of the delegate with the same subscriber', function () {
      var subscriber = {};

      bus.subscribe(subscriber);

      expect(delegate.subscribe.calledOnce).to.be.ok();
      expect(delegate.subscribe.calledOn(delegate)).to.be.ok();
      expect(delegate.subscribe.calledWithExactly(subscriber)).to.be.ok();
    });

    it('subscribe() will return truthy if delegate.subscribe() is truthy', function () {
      delegate.subscribe.returns('ok');

      expect(bus.subscribe({})).to.be.ok();
    });

    it('subscribe() will return falsy if delegate.subscribe() is falsy', function () {
      delegate.subscribe.returns('');

      expect(bus.subscribe({})).not.to.be.ok();
    });
  });

  describe('will delegate publications:', function () {
    it('it has a publish() method', function () {
      expect(bus.publish).to.be.a('function');
    });

    describe("publish(), even called without runtime context, will", function () {
      var event, data, result, publication;
      beforeEach(function () {
        event = 'event type';
        data = 'event data';
        publication = doubles.stubFunction();
        delegate.publish.returns(publication);

        result = publish(event, data);
      });

      it('call the the publish method of the delegate with the same parameters', function () {
        expect(delegate.publish.calledOnce).to.be.ok();
        expect(delegate.publish.calledOn(delegate)).to.be.ok();
        expect(delegate.publish.calledWithExactly(event, data)).to.be.ok();
      });

      it('return the value returned by delegate.publish()', function () {
        expect(result).to.be(publication);
      });
    });
  });

  describe('remembers past publications and will notify them to new subscribers:', function () {
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
          delegate.publish.withArgs(ev.type, ev.data).returns(doubles.stubFunction());
        });

        events.forEach(function (ev) {
          publications.push(publish(ev.type, ev.data));
        });
      });

      describe('given an object has not been susbscribed before, when is subscribed,', function () {
        var subscriber;
        beforeEach(function () {
          subscriber = {};
          delegate.subscribe.returns(false);

          bus.subscribe(subscriber);
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

      it("given an object has been susbscribed before, when is subscribed again, it won't be notified again", function () {
        var subscriber = {};
        delegate.subscribe.returns(true);

        bus.subscribe(subscriber);

        expect(publications[0].called).not.to.be.ok();
        expect(publications[1].called).not.to.be.ok();
        expect(publications[2].called).not.to.be.ok();
      });
    });
  });
});