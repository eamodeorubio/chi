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

function Bus(makePublication) {
  var subscribers = [];

  this.subscribe = function (subscriber) {
    if (subscribers.indexOf(subscriber) !== -1)
      return true;
    subscribers.push(subscriber);
  };

  this.publish = function (event, data) {
    var publication = makePublication(event, data);
    subscribers.forEach(publication);
    return publication;
  };
}

function InMemoryEventStorage(eventEmitter) {
  var publications = [];

  this.subscribe = function (subscriber) {
    var duplicated = eventEmitter.subscribe(subscriber);
    if (duplicated) {
      publications.forEach(function(publication) {
        publication(subscriber);
      });
    }
    return duplicated;
  };

  this.publish = function (event, data) {
    var publication = eventEmitter.publish(event, data);
    publications.push(publication);
    return publication;
  };
}

var self = module.exports = {
  publication:function (event, data, optErrorHandler) {
    return safePublication(event, data, optErrorHandler ? optErrorHandler : logErrorToConsole);
  },
  emitter:function (optPublicationFactory) {
    return new Bus(optPublicationFactory ? optPublicationFactory : self.publication);
  },
  storage:function (optEmitter) {
    return new InMemoryEventStorage(optEmitter ? optEmitter : self.emitter());
  }
};