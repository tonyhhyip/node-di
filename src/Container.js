'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;

const debug = require('debug')('node-di:container');

function Container() {
  if (!(this instanceof Container)) {
    return new Container();
  }
  EventEmitter.call(this);
  this.flush();
}

util.inherits(Container, EventEmitter);

Container.prototype.instance = function (abstract, instance) {
  debug('Register instance "%s"', abstract);
  this.instances[abstract] = instance;
};

Container.prototype.singleton = function (abstract, closure) {
  debug('Register singleton "%s"', abstract);
  this.bind(abstract, closure, true);
};

Container.prototype.bind = function (abstract, builder, shared) {
  debug('Bind "%s"', abstract);
  this.bindings[abstract] = {
    builder,
    shared: !!shared,
  };
};

/**
 *
 * @param {String} abstract
 * @returns {Object}
 */
Container.prototype.make = function (abstract) {
  debug('Make "%s"', abstract);
  const name = this.getAlias(abstract);

  if (name in this.instances && (this.instances[name] !== null || this.instances[name] !== undefined)) {
    debug('Return created "%s"', name);
    return this.instances[name];
  }

  if (!this.hasRegister(name)) {
    debug('"%s" not yet register', name);
    return null;
  }

  const constructor = this.getConstructor(name);

  debug('Run constructor of "%s"', name);
  const instance = constructor.call(null, this);

  if (this.isShared(name)) {
    debug('Register instance "%s"');
    this.instances[name] = instance;
  }

  this.emit('resolve', abstract, instance);

  return instance;
};

Container.prototype.hasRegister = function (name) {
  return name in this.bindings;
};

/**
 * @private
 *
 * @param {String} name
 * @return {Boolean}
 */
Container.prototype.isShared = function (name) {
  return this.bindings[name].shared;
};

/**
 * @private
 *
 * @param {String} name
 * @return {Function}
 */
Container.prototype.getConstructor = function (name) {
  return this.bindings[name].builder;
};

Container.prototype.flush = function () {
  debug('Flush and reset');
  this.forgetInstances();
  this.aliases = new Map();
  this.bindings = [];
};

Container.prototype.forgetInstances = function () {
  debug('ForgetInstances');
  this.instances = [];
};

Container.prototype.forgetInstance = function (abstract) {
  debug(`Remove instance of ${abstract}`);
  delete this.instances[abstract];
};

Container.prototype.getAlias = function (name) {
  debug('Get alias of "%s"', name);
  return this.isAlias(name) ? this.aliases.get(name) : name;
};

Container.prototype.isAlias = function (name) {
  debug('Check is "%s" alias', name);
  return this.aliases.has(name);
};

Container.prototype.alias = function (name, abstract) {
  debug(`Create alias ${name} of ${abstract}`);
  this.aliases.set(name, abstract);
};

module.exports = Container;
