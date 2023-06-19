const debug = require('debug')('node-di:provider');

/* eslint-disable class-methods-use-this */

class ServiceProvider {
  constructor() {
    debug('Create Service Provider: [%s]', this.constructor.name);
    this.defer = false;
    this.booted = false;
  }

  /**
   * @return {Array<Symbol>}
   */
  get provides() {
    return [];
  }

  /**
   * @return {boolean}
   */
  get isDefer() {
    return this.defer;
  }

  /**
   * @param {import('./Kernel')} app
   */
  // eslint-disable-next-line no-unused-vars
  register(app) {}

  boot() {
    debug('Boot up service provider: [%s]', this.constructor.name);
    this.booted = true;
  }

  /**
   * @return {boolean}
   */
  get isBooted() {
    return this.booted;
  }
}

module.exports = ServiceProvider;
