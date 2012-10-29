"use strict";

function logErrorToConsole(error) {
  console.log(error);
}

function safePublication(event, data, errorHandler) {
  return function (target) {
    try {
      target[event](data);
    } catch (err) {
      errorHandler(err.toString());
    }
  };
}

function makeBus(makePublication) {
  var me = {},
      subscribers = [];

  me.subscribe = function (subscriber) {
    if (subscribers.indexOf(subscriber) !== -1)
      return true;
    subscribers.push(subscriber);
  };

  me.publish = function (event, data) {
    var publication = makePublication(event, data);
    subscribers.forEach(publication);
    return publication;
  };

  return me;
}

function makeBusWithMemory(bus) {
  var me = {},
      publications = [];

  me.subscribe = function (subscriber) {
    if (bus.subscribe(subscriber))
      return true;
    publications.forEach(function (publication) {
      publication(subscriber);
    });
  };

  me.publish = function (event, data) {
    var publication = bus.publish(event, data);
    publications.push(publication);
    return publication;
  };

  return me;
}

var self = module.exports = {
  publication:function (event, data, optErrorHandler) {
    return safePublication(event, data, optErrorHandler ? optErrorHandler : logErrorToConsole);
  },
  makeBus:function (optPublicationFactory) {
    return makeBus(optPublicationFactory ? optPublicationFactory : self.publication);
  },
  makeBusWithMemory:function (optBus) {
    return makeBusWithMemory(optBus ? optBus : self.makeBus());
  }
};