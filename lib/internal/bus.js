"use strict";

function safeNotification(event, data) {
  return function (target) {
    try {
      target[event](data);
    } catch (err) {
      // Ignore??? Really????
    }
  };
}

module.exports.EventBus = function () {
  var subscriptors = [], publications = [];

  this.subscribe = function (subscriptor) {
    if (subscriptors.indexOf(subscriptor) !== -1)
      return;
    subscriptors.push(subscriptor);
    var numberOfPublications = publications.length;
    for (var i = 0; i < numberOfPublications; i++)
      publications[i](subscriptor);
  };

  function notify(event, data) {
    var notification = safeNotification(event, data);
    var numberOfFeeds = subscriptors.length;
    for (var i = 0; i < numberOfFeeds; i++)
      notification(subscriptors[i]);
    return notification;
  }

  this.publish = function (event, data) {
    publications.push(notify(event, data));
  };

  this.fire = function (event, data) {
    notify(event, data);
  };
};