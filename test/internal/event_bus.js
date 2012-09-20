"use strict";

var expect = require('expect.js'),
    doubles = require('../doubles'),
    busModule = require('../../lib/internal/bus');

describe('An EventBus:', function () {
  var bus;

  beforeEach(function () {
    bus = new busModule.EventBus();
  });

  it('it has a subscribe() method', function () {
    expect(bus.subscribe).to.be.a('function');
  });

  it('it has a publish() method', function () {
    expect(bus.publish).to.be.a('function');
  });

  function knowsHowToNotify(notificationType) {
    return function (event) {
      describe('knows how to ' + notificationType + ' events of type "' + event + '":', function () {
        describe('given several objects has been subscribed to it', function () {
          var subscriptor1, subscriptor2, data;

          beforeEach(function () {
            data = 'passed data';

            subscriptor1 = doubles.double(['x', 'y', 'z']);
            subscriptor2 = doubles.double(['x', 'y', 'z']);

            bus.subscribe(subscriptor1);
            bus.subscribe(subscriptor2);
          });

          describe('when ' + notificationType + 'ing an event ' + event + ' with some data, it', function () {
            var result;

            beforeEach(function () {
              result = bus[notificationType](event, data);
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

          describe('when ' + notificationType + 'ing an event ' + event + ', and one of the subscriptors throws an exception, it', function () {
            beforeEach(function () {
              subscriptor1[event].throws();
            });

            it('will still call ' + event + '() on the other objects', function () {
              bus[notificationType](event, data);

              expect(subscriptor2[event].called).to.be.ok();
            });
          });
        });

        describe('given the same object has beed subscribed several times', function () {
          var aobject;
          beforeEach(function () {
            aobject = doubles.double(['x', 'y', 'z']);

            bus.subscribe(aobject);
            bus.subscribe(aobject);
            bus.subscribe(aobject);
          });

          it('when ' + notificationType + 'ing an event ' + event + ', it will still call ' + event + '() on the duplicated object exactly one time', function () {
            bus[notificationType](event, "not important");

            expect(aobject[event].calledOnce).to.be.ok();
          });
        });
      });
    };
  }

  ['x', 'y', 'z'].forEach(knowsHowToNotify('publish'));
  ['x', 'y', 'z'].forEach(knowsHowToNotify('fire'));

  describe('given several objects has been subscribed', function () {
    var subscriptor1, subscriptor2, events;
    beforeEach(function () {
      subscriptor1 = doubles.double(['a', 'b']);
      subscriptor2 = doubles.double(['a', 'b']);
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

      bus.subscribe(subscriptor1);
      bus.subscribe(subscriptor2);
    });

    describe('given several events has been published', function () {
      beforeEach(function () {
        events.forEach(function (ev) {
          bus.publish(ev.type, ev.data);
        });
      });

      describe('when a new object is subscribed,', function () {
        var subscriptor3;
        beforeEach(function () {
          subscriptor3 = doubles.double(['a', 'b']);

          bus.subscribe(subscriptor3);
        });

        it('it will be notified of all prior published events', function () {
          expect(subscriptor3.a.calledTwice).to.be.ok();
          expect(subscriptor3.b.calledOnce).to.be.ok();
        });

        it('it will be notified in order of publication', function () {
          expect(subscriptor3.a.firstCall.calledBefore(subscriptor3.b.firstCall)).to.be.ok();
          expect(subscriptor3.a.secondCall.calledAfter(subscriptor3.b.firstCall)).to.be.ok();
        });

        it('it will be not notified again is it is subscribed again', function () {
          bus.subscribe(subscriptor3);

          expect(subscriptor3.a.callCount).to.be(2);
          expect(subscriptor3.b.callCount).to.be(1);
        });
      });
    });

    describe('given several events has been fired', function () {
      beforeEach(function () {
        events.forEach(function (ev) {
          bus.fire(ev.type, ev.data);
        });
      });

      it('when a new object is subscribed, it will not be notified of all prior published events', function () {
        var subscriptor3 = doubles.double(['a', 'b']);

        bus.subscribe(subscriptor3);

        expect(subscriptor3.a.called).not.to.be.ok();
        expect(subscriptor3.b.called).not.to.be.ok();
      });
    });
  });
});