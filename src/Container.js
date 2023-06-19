const { EventEmitter } = require('events');

const debug = require('debug')('node-di:container');

class Container extends EventEmitter {
  constructor() {
    super();
    /**
     * @type {Map<Symbol, Object>}
     */
    this.instances = new Map();
    /**
     * @type {Map<Symbol, Symbol>}
     */
    this.aliases = new Map();
    /**
     * @typedef {Object} Binding
     * @property {Function} factory
     * @property {Array<Symbol>} dependencies
     * @property {boolean} shared
     */
    /**
     * @type {Map<Symbol, Binding>}
     */
    this.bindings = new Map();
  }

  /**
   * @param {Symbol} abstract
   * @param {object} instance
   */
  instance(abstract, instance) {
    debug('Register instance "%s"', abstract);

    if (!this.instances) {
      this.instances = new Map();
    }

    this.instances.set(abstract, instance);
  }

  /**
   * @param {Symbol} abstract
   * @param {Function} factory
   * @param {Array<Symbol>} dependencies
   */
  singleton(abstract, factory, dependencies) {
    debug('Register singleton "%s"', abstract);
    this.bind(abstract, factory, dependencies, true);
  }

  /**
   * @param {Symbol} abstract
   * @param {Function} factory
   * @param {Array<Symbol>} dependencies
   * @param {boolean} shared
   */
  bind(abstract, factory, dependencies, shared = false) {
    debug('Bind "%s"', abstract);

    if (!this.bindings) {
      this.bindings = new Map();
    }

    this.bindings.set(abstract, {
      factory,
      shared,
      dependencies,
    });
  }

  /**
   * @param {Symbol} abstract
   * @return {Promise<Object|null>}
   */
  async make(abstract) {
    debug('Make "%s"', abstract);
    const name = this.resolveAlias(abstract);

    if (this.instances.has(name)) {
      debug('Return created "%s"', name);
      return this.instances.get(name);
    }

    if (!this.hasRegister(name)) {
      debug('"%s" not yet register', name);
      return null;
    }

    const { factory, dependencies, shared } = this.bindings.get(name);

    const dependencyInstances = await Promise.all(
      dependencies.map((dependency) => this.make(dependency)),
    );

    debug('Run factory of "%s"', name);
    // eslint-disable-next-line prefer-spread
    const instance = await factory.apply(null, dependencyInstances);

    if (shared) {
      debug('Register instance "%s"');
      this.instances.set(name, instance);
    }

    this.emit('resolve', abstract, instance);

    return instance;
  }

  /**
   * @param {Symbol} name
   * @returns {boolean}
   */
  hasRegister(name) {
    return this.bindings.has(name);
  }

  forgetInstances() {
    this.instances = new Map();
  }

  flush() {
    debug('Flush and reset');
    this.forgetInstances();
    this.aliases = new Map();
    this.bindings = new Map();
  }

  /**
   * @param {Symbol} name
   * @param {Symbol} abstract
   */
  alias(name, abstract) {
    debug(`Create alias ${name.toString()} of ${abstract.toString()}`);

    if (!this.aliases) {
      this.aliases = new Map();
    }

    this.aliases.set(name, abstract);
  }

  /**
   * @param {Symbol} name
   * @return {Symbol}
   */
  resolveAlias(name) {
    let target = name;
    while (this.aliases.has(target)) {
      target = this.aliases.get(target);
    }
    return target;
  }
}

module.exports = Container;
