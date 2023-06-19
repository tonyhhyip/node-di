/* global describe, it, expect */

const Container = require('./Container');
const Kernel = require('./Kernel');
const ServiceProvider = require('./ServiceProvider');

describe('Test Kernel', () => {
  it('Test constructor', () => {
    const container = new Kernel();
    const instance = expect(container);
    instance.toBeInstanceOf(Kernel);
    instance.toBeInstanceOf(Container);
    expect('alias' in container).toBeTruthy();
  });

  it('Test service provider', () => {
    class TestServiceProvider extends ServiceProvider {
      // eslint-disable-next-line class-methods-use-this
      get provides() {
        return ['a'];
      }

      // eslint-disable-next-line class-methods-use-this
      register(app) {
        app.instance('a', 'a');
      }
    }
    const kernel = new Kernel();
    kernel.register(TestServiceProvider);
  });
});
