/* global describe, it, expect */

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
    class TestServiceProvider extends ServiceProvider {
      provides() {
        return ['a'];
      }

      register(app) {
        app.instance('a', 'a');
      }
    }

    const kernel = new Kernel();
    kernel.register(TestServiceProvider);
  });
});
