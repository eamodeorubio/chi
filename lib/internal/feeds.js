"use strict";

var SuccessState = {
  yields:function (value) {
    throw 'Cannot yield new values, beause it has completed succesfuly';
  },
  throws:function (error) {
    throw 'Cannot throw an error, beause it has completed succesfuly';
  },
  done:function () {
    return this;
  }
};

function FailedState(fail) {
  this.yields = function (value) {
    throw 'Cannot yield new values, beause it has failed:[' + fail + ']';
  };
  this.throws = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, beause it has yet failed with:[' + fail + ']';
    return this;
  };
  this.done = function () {
    throw 'Cannot be "done", beause it has failed:[' + fail + ']';
  };
}

function YieldingState(bus, yieldNotificationType, stateFactory) {
  this.yields = function (value) {
    bus[yieldNotificationType]('yield', value);
    return this;
  };
  this.throws = function (error) {
    bus.publish('throw', error);
    return stateFactory.failedState(error);
  };
  this.done = function () {
    bus.publish('done');
    return stateFactory.successState();
  };
}

function Feed(bus, initialState, isFeed) {
  var currentState = initialState, me = this;

  function publishMethodFor(event) {
    me[event] = function (data) {
      currentState = currentState[event](data);
      return me;
    };
  }

  ['yields', 'throws', 'done'].forEach(publishMethodFor);

  this.chain = function (feed) {
    if (!isFeed(feed))
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
  plugins:{},
  feed:function (bus, initialState, optFeedCheck) {
    return new Feed(bus, initialState, typeof optFeedCheck === 'function' ? optFeedCheck : this.isFeed);
  },
  yieldingState:function (bus, yieldNotificationType, optFactory) {
    return new YieldingState(bus, yieldNotificationType, optFactory ? optFactory : this);
  },
  initialStateFor:function (pluginName, bus, yieldNotificationType, args) {
    // TODO
  },
  registerPlugin:function (name, plugin) {
    this.plugins[name] = plugin;
  },
  failedState:function (fail) {
    return new FailedState(fail);
  },
  successState:function () {
    return SuccessState;
  },
  isFeed:function (feed) {
    return feed &&
        typeof feed.yields === 'function' &&
        typeof feed.throws === 'function' &&
        typeof feed.done === 'function' &&
        typeof feed.chain === 'function';
  }
};