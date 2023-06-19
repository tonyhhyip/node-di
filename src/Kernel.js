const debug = require('debug')('node-di:kernel');
const Container = require('./Container');
const boot = require('./booter');

class Kernel extends Container {
  constructor() {
    super();
    this.providers = [];
    this.defer = new Map();
    this.bootstrap = false;

    boot(this);
  }

  /**
   * @param {Symbol} abstract
   */
  loadDeferServiceProvider(abstract) {
    const instance = this.defer.get(abstract);
    debug('Load [%s] from defer service provider [%s]', instance.constructor.name);
    if (!instance.isBooted()) {
      debug('Boot up defer service provider [%s]', instance.constructor.name);
      instance.register(this);
      boot(instance);
      this.providers.push(instance);
    }
    this.defer.delete(abstract);
  }

  /**
   * @param {Symbol}abstract
   * @return {Promise<object|null>}
   */
  async make(abstract) {
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

    return super.make(abstract);
  }

  flush() {
    this.providers = [];
  }

  /**
   * @param {typeof import('./ServiceProvider')} Provider
   */
  register(Provider) {
    let instance = Provider;
    if (typeof Provider === 'function') {
      instance = new Provider(this);
    }
    debug('Register Service Provider [%s]', instance.constructor.name);
    if (instance.isDefer) {
      debug('Add defer service provider [%s]', instance.constructor.name);
      instance.provides.forEach((abstract) => {
        this.defer.set(abstract, instance);
      });
      return;
    }

    if (!instance.isBooted) {
      debug('Boot service provider [%s]', instance.name);
      instance.register(this);
      this.bootstrap = true;
      this.providers.push(instance);
    }

    this.emit('register', instance);
  }
}

module.exports = Kernel;
