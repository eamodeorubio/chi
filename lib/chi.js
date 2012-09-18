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
  }
};

function FailedState(fail) {
  this.yield = function (value) {
    throw 'Cannot yield new values, beause it has failed:[' + fail + ']';
  };
  this.throw = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, beause it has yet failed with:[' + fail + ']';
  };
  this.done = function () {
    throw 'Cannot be "done", beause it has failed:[' + fail + ']';
  };
}

function Emitter() {
  var eventBus = new utils.EventBus()
      , currentState = {
        "yield":function (value) {
          eventBus.publish('yield', value);
        },
        "throw":function (error) {
          eventBus.publish('throw', error);
          currentState = new FailedState(error);
        },
        "done":function () {
          eventBus.publish('done');
          currentState = SuccessState;
        }
      };

  this.yield = function (value) {
    currentState.yield(value);
    return this;
  };

  this.throw = function (error) {
    currentState.throw(error);
    return this;
  };

  this.done = function () {
    currentState.done();
    return this;
  };

  this.chain = function (feed) {
    if (!utils.isFeed(feed))
      throw 'Only a proper feed object can be subscribed to events, it was:[(' + typeof feed + '):' + feed + ']';
    eventBus.subscribe(feed);
    return {
      chain:function (otherFeed) {
        return feed.chain(otherFeed);
      }
    };
  };
}

module.exports.emitter = function () {
  return new Emitter();
};