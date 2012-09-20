"use strict";

var utils = require('./utils');

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
  var currentState = initialState, me = this;

  function publishMethodFor(event) {
    me[event] = function (data) {
      currentState = currentState[event](data);
      return me;
    }
  }

  ['yield', 'throw', 'done'].forEach(publishMethodFor);

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

module.exports = {
  feed:function (bus, initialState) {
    return new Feed(bus, initialState);
  },
  yieldingState:function (bus, yieldNotificationType) {
    return new YieldingState(bus, yieldNotificationType);
  },
  failedState:function (fail) {
    return new FailedState(fail);
  },
  successState:function () {
    return SuccessState;
  }
};