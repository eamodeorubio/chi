"use strict";

var expect = require('expect.js'),
    doubles = require('../helpers/doubles'),
    busModule = require('../../lib/internal/bus');

describe('An event emitter,', function () {
  var emitter;

  beforeEach(function () {
    emitter = new busModule.emitter();
  });

  it('it has a subscribe() method', function () {
    expect(emitter.subscribe).to.be.a('function');
  });

  it('subscribe() will return if the subscriber has been subscribed before', function () {
    var subscriber = {};

    expect(emitter.subscribe(subscriber)).not.to.be.ok();
    expect(emitter.subscribe(subscriber)).to.be.ok();
    expect(emitter.subscribe(subscriber)).to.be.ok();
  });

  it('it has a publish() method', function () {
    expect(emitter.publish).to.be.a('function');
  });

  describe("publish():", function () {
    var event, data, publication;
    beforeEach(function () {
      event = 'x';
      data = 'args';

      publication = emitter.publish(event, data);
    });

    it('will return a publication function', function () {
      expect(publication).to.be.a('function');
    });

    it("the publication function will notify the event with the data to the listener passed as argument", function () {
      var listener = doubles.double(['x', 'y']);

      publication(listener);

      expect(listener.x.calledOnce).to.be.ok();
      expect(listener.x.calledOn(listener)).to.be.ok();
      expect(listener.x.calledWithExactly(data)).to.be.ok();
      expect(listener.y.called).not.to.be.ok();
    });

    it("the publication function won't fail if the listener cannot receive the event", function () {
      expect(function () {
        publication(doubles.double(['z']));
      }).not.to.throwError();
    });
  });

  function knowsHowToPublishEvents() {
    return function (event) {
      describe('it knows how to publish events of type "' + event + '":', function () {
        describe('given several objects has been subscribed to it', function () {
          var subscriber1, subscriber2, data;

          beforeEach(function () {
            data = 'passed data';

            subscriber1 = doubles.double(['x', 'y', 'z']);
            subscriber2 = doubles.double(['x', 'y', 'z']);

            emitter.subscribe(subscriber1);
            emitter.subscribe(subscriber2);
          });

          describe('when publishing an event ' + event + ' with some data, it', function () {
            var result;

            beforeEach(function () {
              result = emitter.publish(event, data);
            });

            it('will call the method ' + event + '() on all subscriptors exactly one time', function () {
              expect(subscriber1[event].calledOnce).to.be.ok();
              expect(subscriber1[event].calledOn(subscriber1)).to.be.ok();

              expect(subscriber2[event].calledOnce).to.be.ok();
              expect(subscriber2[event].calledOn(subscriber2)).to.be.ok();
            });

            it('will pass the same argument to all subscriptors', function () {
              expect(subscriber1[event].calledWithExactly(data)).to.be.ok();
              expect(subscriber2[event].calledWithExactly(data)).to.be.ok();
            });
          });

          describe('while publishing an event ' + event + ', if one of the subscriptors throws an exception, it', function () {
            beforeEach(function () {
              subscriber1[event].throws();
            });

            it('will still call ' + event + '() on the other objects', function () {
              emitter.publish(event, data);

              expect(subscriber2[event].called).to.be.ok();
            });
          });
        });

        describe('given the same object has beed subscribed several times', function () {
          var aobject;
          beforeEach(function () {
            aobject = doubles.double(['x', 'y', 'z']);

            emitter.subscribe(aobject);
            emitter.subscribe(aobject);
            emitter.subscribe(aobject);
          });

          it('when publishing an event ' + event + ', it will still call ' + event + '() on the duplicated object exactly one time', function () {
            emitter.publish(event, "not important");

            expect(aobject[event].calledOnce).to.be.ok();
          });
        });
      });
    };
  }

  ['x', 'y', 'z'].forEach(knowsHowToPublishEvents());

  describe("will not remember past events, and won't notify them to new subscribers", function () {
    describe('given that several events has been published,', function () {
      beforeEach(function () {
        [
          {
            type:'a', data:22
          },
          {
            type:'b', data:'asdad'
          },
          {
            type:'a', data:2
          }
        ].forEach(function (ev) {
              emitter.publish(ev.type, ev.data);
            });
      });

      it("when a new object is subscribed, it won't be notified about the past events", function () {
        var subscriber = doubles.double(['a', 'b']);

        emitter.subscribe(subscriber);

        expect(subscriber.a.called).not.to.be.ok();
        expect(subscriber.b.called).not.to.be.ok();
      });
    });
  });
});