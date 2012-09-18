"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    utils = require('../../lib/internal/utils');

describe('An EventBus:', function () {
  var bus;

  beforeEach(function () {
    bus = new utils.EventBus();
  });

  it('it has a subscribe() method', function () {
    expect(bus.subscribe).to.be.a('function');
  });

  it('it has a publish() method', function () {
    expect(bus.publish).to.be.a('function');
  });

  function knowsHowToPublish(event) {
    describe('knows how to publish events of type "' + event + '":', function () {
      describe('given several objects has been subscribed to it', function () {
        var subscriptor1, subscriptor2, data;

        beforeEach(function () {
          data = 'passed data';

          subscriptor1 = doubles.double(['x','y','z']);
          subscriptor2 = doubles.double(['x','y','z']);

          bus.subscribe(subscriptor1);
          bus.subscribe(subscriptor2);
        });

        describe('when publishing event ' + event + ' with some data, it', function () {
          var result;

          beforeEach(function () {
            result = bus.publish(event, data);
          });

          it('will return nothing', function () {
            expect(result).to.be(undefined);
          });

          it('will call the method ' + event + '() on all subscriptors exactly one time', function () {
            expect(subscriptor1[event].calledOnce).to.be.ok();
            expect(subscriptor1[event].calledOn(subscriptor1)).to.be.ok();

            expect(subscriptor2[event].calledOnce).to.be.ok();
            expect(subscriptor2[event].calledOn(subscriptor2)).to.be.ok();
          });

          it('will pass the same argument to all subscriptors', function () {
            expect(subscriptor1[event].calledWithExactly(data)).to.be.ok();
            expect(subscriptor2[event].calledWithExactly(data)).to.be.ok();
          });
        });

        describe('when publishing event ' + event + ', and one of the subscriptors throws an exception, it', function () {
          beforeEach(function () {
            subscriptor1[event].throws();
          });

          it('will still call ' + event + '() on the other objects', function () {
            bus.publish(event, data);

            expect(subscriptor2[event].called).to.be.ok();
          });
        });
      });

      describe('given the same object has beed subscribed several times', function () {
        var aobject;
        beforeEach(function () {
          aobject = doubles.double(['x','y','z']);

          bus.subscribe(aobject);
          bus.subscribe(aobject);
          bus.subscribe(aobject);
        });

        it('when publishing event ' + event + ', it will still call ' + event + '() on the duplicated object exactly one time', function () {
          bus.publish(event, "not important");

          expect(aobject[event].calledOnce).to.be.ok();
        });
      });
    });
  }

  ['x', 'y', 'z'].forEach(knowsHowToPublish);

  describe('given several objects has been subscribed', function () {
    var subscriptor1, subscriptor2;
    beforeEach(function () {
      subscriptor1 = doubles.double(['a', 'b']);
      subscriptor2 = doubles.double(['a', 'b']);

      bus.subscribe(subscriptor1);
      bus.subscribe(subscriptor2);
    });
    describe('given several events has been published', function () {
      var events;
      beforeEach(function () {
        events = [
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
        events.forEach(function (ev) {
          bus.publish(ev.type, ev.data);
        });
      });

      it('when a new object is subscribed, it will be notified of all prior published events', function () {
        var subscriptor3 = doubles.double(['a', 'b']);

        bus.subscribe(subscriptor3);

        expect(subscriptor3.a.calledTwice).to.be.ok();
        expect(subscriptor3.b.calledOnce).to.be.ok();
      });

    });
  });
});