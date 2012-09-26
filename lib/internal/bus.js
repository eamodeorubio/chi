"use strict";

function safePublication(event, data) {
  return function (target) {
    try {
      target[event](data);
    } catch (err) {
      // Ignore??? Really????
    }
  };
}

function EventEmitter(newPublication) {
  var subscribers = [];

  this.subscribe = function (subscriber) {
    if (subscribers.indexOf(subscriber) !== -1)
      return true;
    subscribers.push(subscriber);
  };

  this.publish = function (event, data) {
    var publication = newPublication(event, data);
    var numberOfFeeds = subscribers.length;
    for (var i = 0; i < numberOfFeeds; i++)
      publication(subscribers[i]);
    return publication;
  };
}

function InMemoryEventStorage(eventEmitter) {
  var publications = [];

  this.subscribe = function (subscriber) {
    var duplicated = eventEmitter.subscribe(subscriber);
    if (duplicated) {
      var publicationsCount = publications.length;
      for (var i = 0; i < publicationsCount; i++)
        publications[i](subscriber);
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
  publication:function (event, data) {
    return safePublication(event, data);
  },
  emitter:function (optPublicationFactory) {
    return new EventEmitter(optPublicationFactory ? optPublicationFactory : self.publication);
  },
  storage:function (optEmitter) {
    return new InMemoryEventStorage(optEmitter ? optEmitter : self.emitter());
  }
};