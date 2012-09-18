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
      describe('given several feeds has been subscribed to it', function () {
        var feed1, feed2, data;

        beforeEach(function () {
          data = 'passed data';

          feed1 = doubles.makeFeed();
          feed2 = doubles.makeFeed();

          bus.subscribe(feed1);
          bus.subscribe(feed2);
        });

        describe('when publishing event ' + event + ' with some data, it', function () {
          var result;

          beforeEach(function () {
            result = bus.publish(event, data);
          });

          it('will return nothing', function () {
            expect(result).to.be(undefined);
          });

          it('will call the method ' + event + '() on all subscribed feeds exactly one time', function () {
            expect(feed1[event].calledOnce).to.be.ok();
            expect(feed1[event].calledOn(feed1)).to.be.ok();

            expect(feed2[event].calledOnce).to.be.ok();
            expect(feed2[event].calledOn(feed2)).to.be.ok();
          });

          it('will pass the same argument to all subscribed feeds', function () {
            expect(feed1[event].calledWithExactly(data)).to.be.ok();
            expect(feed2[event].calledWithExactly(data)).to.be.ok();
          });
        });

        describe('when publishing event ' + event + ', and one of the subscribed feeds throws an exception, it', function () {
          beforeEach(function () {
            feed1[event].throws();
          });

          it('will still call ' + event + '() on the other feeds', function () {
            bus.publish(event, data);

            expect(feed2[event].called).to.be.ok();
          });
        });
      });

      describe('given the same feed has beed subscribed several times', function () {
        var aFeed;
        beforeEach(function () {
          aFeed = doubles.makeFeed();

          bus.subscribe(aFeed);
          bus.subscribe(aFeed);
          bus.subscribe(aFeed);
        });

        it('when publishing event ' + event + ', it will still call ' + event + '() on the duplicated feed exactly one time', function () {
          bus.publish(event, "not important");

          expect(aFeed[event].calledOnce).to.be.ok();
        });
      });
    });
  }

  ['yield', 'throw'].forEach(knowsHowToPublish);
});