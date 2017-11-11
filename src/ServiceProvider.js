

const debug = require('debug')('node-di:provider');

function ServiceProvider(app) {
  debug('Create Service Provider: [%s]', this.constructor.name);
  this.app = app;
  this.defer = false;
  this.booted = false;
}

// eslint-disable-next-line no-unused-vars
ServiceProvider.prototype.register = function (app) {};

ServiceProvider.prototype.provides = function () {
  return [];
};

ServiceProvider.prototype.isDefer = function () {
  return this.defer;
};

ServiceProvider.prototype.boot = function () {
  debug('Boot up service provider: [%s]', this.constructor.name);
  this.booted = true;
};

ServiceProvider.prototype.isBooted = function () {
  return !!this.booted;
};

module.exports = ServiceProvider;
