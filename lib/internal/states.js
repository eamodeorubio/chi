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

function YieldingState(output, factory) {
  this.yields = function (value) {
    output('yield', value);
    return this;
  };
  this.throws = function (error) {
    output('throw', error);
    return factory('failed', error);
  };
  this.done = function () {
    output('done');
    return factory('success');
  };
}

var self = module.exports = {
  yieldingState:function (output, optFactory) {
    return new YieldingState(output, optFactory ? optFactory : self.stateFactoryWith(output));
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