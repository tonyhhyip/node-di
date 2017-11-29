/* global describe, it, expect */

const util = require('util');
const Container = require('./Container');
const Kernel = require('./Kernel');
const ServiceProvider = require('./ServiceProvider');

describe('Test Kernel', () => {
  it('test export', () => {
    expect(typeof Kernel).toBe('function');
    expect(Kernel.name).toBe('Kernel');
  });

  it('Test constructor', () => {
    const container = new Kernel();
    const instance = expect(container);
    instance.toBeInstanceOf(Kernel);
    instance.toBeInstanceOf(Container);
    expect('alias' in container).toBeTruthy();

    expect(Kernel()).toBeInstanceOf(Kernel);
  });

  it('Test service provider', () => {
    function TestServiceProvider(app) {
      ServiceProvider.call(this, app);
    }
    util.inherits(TestServiceProvider, ServiceProvider);
    TestServiceProvider.prototype.provides = () => ['a'];

    TestServiceProvider.prototype.register = function (app) {
      app.instance('a', 'a');
    };
    const kernel = new Kernel();
    kernel.register(TestServiceProvider);
  });
});
