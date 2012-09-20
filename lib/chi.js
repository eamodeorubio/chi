"use strict";

var utils = require('./internal/utils');

var SuccessState = {
  "yield":function (value) {
    throw 'Cannot yield new values, beause it has completed succesfuly';
  },
  "throw":function (error) {
    throw 'Cannot throw an error, beause it has completed succesfuly';
  },
  "done":function () {
    return this;
  }
};

function FailedState(fail) {
  this.yield = function (value) {
    throw 'Cannot yield new values, beause it has failed:[' + fail + ']';
  };
  this.throw = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, beause it has yet failed with:[' + fail + ']';
    return this;
  };
  this.done = function () {
    throw 'Cannot be "done", beause it has failed:[' + fail + ']';
  };
}

function YieldingState(bus, yieldNotificationType) {
  this.yield = function (value) {
    bus[yieldNotificationType]('yield', value);
    return this;
  };
  this.throw = function (error) {
    bus.publish('throw', error);
    return new FailedState(error);
  };
  this.done = function () {
    bus.publish('done');
    return SuccessState;
  };
}

function Feed(bus, initialState) {
  var currentState = initialState;

  this.yield = function (value) {
    currentState = currentState.yield(value);
    return this;
  };

  this.throw = function (error) {
    currentState = currentState.throw(error);
    return this;
  };

  this.done = function () {
    currentState = currentState.done();
    return this;
  };

  this.chain = function (feed) {
    if (!utils.isFeed(feed))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof feed + '):' + feed + ']';
    bus.subscribe(feed);
    return {
      chain:function (otherFeed) {
        return feed.chain(otherFeed);
      }
    };
  };
}

module.exports.emitter = function () {
  var bus = new utils.EventBus();
  return new Feed(bus, new YieldingState(bus, 'fire'));
};

module.exports.list = function () {
  var bus = new utils.EventBus();
  return new Feed(bus, new YieldingState(bus, 'publish'));
};