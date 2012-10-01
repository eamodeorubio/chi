"use strict";

var plugins = {};

var SuccessState = {
  yields:function (value) {
    throw 'Cannot yield new values, because it has completed succesfuly';
  },
  throws:function (error) {
    throw 'Cannot throw an error, because it has completed succesfuly';
  },
  done:function () {
    return this;
  }
};

function FailedState(fail) {
  this.yields = function (value) {
    throw 'Cannot yield new values, because it has failed:[' + fail + ']';
  };
  this.throws = function (error) {
    if (fail !== error)
      throw 'Cannot throw new errors, because it has yet failed with:[' + fail + ']';
    return this;
  };
  this.done = function () {
    throw 'Cannot be "done", because it has failed:[' + fail + ']';
  };
}

function YieldingState(bus, stateFactory) {
  this.yields = function (value) {
    bus.publish('yield', value);
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

var self = module.exports = {
  yieldingState:function (bus, optFactory) {
    return new YieldingState(bus, optFactory ? optFactory : self);
  },
  stateFactoryWith:function (output) {
    return function factory(pluginName, opts) {
      return plugins[pluginName](output, factory, opts);
    };
  },
  registerPlugin:function (name, plugin) {
    plugins[name] = plugin;
  },
  failedState:function (fail) {
    return new FailedState(fail);
  },
  successState:function () {
    return SuccessState;
  }
};