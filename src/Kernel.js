

const util = require('util');
const debug = require('debug')('node-di:kernel');
const Container = require('./Container');
const construct = require('./utils');
const boot = require('./booter');

function Kernel() {
  if (!(this instanceof Kernel)) {
    return new Kernel();
  }

  Container.call(this);

  this.providers = [];
  this.defer = [];
  this.bootstrap = false;

  boot(this);
}

util.inherits(Kernel, Container);

Kernel.prototype.loadDeferServiceProvider = function (abstract) {
  const instance = this.defer[abstract];
  debug('Load [%s] from defer service provider [%s]', instance.constructor.name);
  if (!instance.isBooted()) {
    debug('Boot up defer service provider [%s]', instance.constructor.name);
    instance.register(this);
    boot(instance);
    this.providers.push(instance);
  }
  delete this.defer[abstract];
};

Kernel.prototype.make = function (abstract) {
  debug('Make "%s"', abstract);
  if (this.bootstrap) {
    debug('Bootstrap All Provider');
    this.providers.forEach((provider) => {
      if (!provider.isBooted()) provider.boot();
    });
    this.bootstrap = false;
  }

  if (abstract in this.defer) {
    this.loadDeferServiceProvider(abstract);
  }

  return Container.prototype.make.call(this, abstract);
};

Kernel.prototype.flush = function () {
  Container.prototype.flush.call(this);
  this.providers = [];
};

Kernel.prototype.loadDeferServiceProvider = function (abstract) {
  const instance = this.defer[abstract];
  debug('Load [%s] from defer service provider [%s]', instance.constructor.name);
  if (!instance.isBooted()) {
    debug('Boot up defer service provider [%s]', instance.constructor.name);
    instance.register(this);
    boot(instance);
    this.providers.push(instance);
  }
  delete this.defer[abstract];
};

Kernel.prototype.register = function (provider) {
  if (typeof provider !== 'function') {
    throw new TypeError('Provider should be a class or function');
  }
  debug('Register Service Provider [%s]', provider.name);
  const instance = construct(provider, this);
  if (instance.isDefer()) {
    debug('Add defer service provider [%s]', provider.name);
    const self = this;
    instance.provides().forEach((abstract) => {
      self.defer[abstract] = instance;
    });
    return;
  }

  if (!instance.isBooted()) {
    debug('Boot service provider [%s]', provider.name);
    instance.register(this);
    // instance.boot();
    this.bootstrap = true;
    this.providers.push(instance);
  }

  this.emit('register', provider);
};

module.exports = Kernel;
