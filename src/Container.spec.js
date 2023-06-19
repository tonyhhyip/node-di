/* global describe, it, expect */

const { EventEmitter } = require('events');
const Container = require('./Container');

describe('Container Test', () => {
  it('Test constructor', () => {
    const container = new Container();
    const instance = expect(container);
    instance.toBeInstanceOf(Container);
    instance.toBeInstanceOf(EventEmitter);
    expect('alias' in container).toBeTruthy();
  });

  it('Test instance method', () => {
    const container = new Container();
    const abstract = Symbol('test');
    const instance = 'Testing';
    container.instance(abstract, instance);

    expect(container.instances.get(abstract)).toEqual(instance);
  });

  it('Test forgetInstances method', () => {
    const container = new Container();
    const abstract = Symbol('test');
    container.instances.set(abstract, 'Testing');
    container.instances.set(Symbol('foo'), 'bar');

    container.forgetInstances();
    expect(container.hasRegister(abstract)).toBe(false);
  });

  it('Test alias method', () => {
    const container = new Container();
    const name = Symbol('foo');
    const abstract = Symbol('bar');
    container.alias(name, abstract);

    expect(container.aliases.get(name)).toBe(abstract);
  });

  it('Test singleton function', () => {
    function factory() { return null; }
    const container = new Container();
    const abstract = Symbol('foo');
    container.singleton(abstract, factory, []);

    const binding = container.bindings.get(abstract);

    expect(binding).toEqual({ factory, shared: true, dependencies: [] });
  });

  it('Test make function', async () => {
    const container = new Container();
    container.aliases.set('foo', 'bar');
    container.aliases.set('build', 'make');
    container.instances.set('bar', 'foo');
    container.bindings.set('test', {
      shared: true,
      factory() {
        return new Date();
      },
      dependencies: [],
    });

    container.bindings.set('make', {
      shared: false,
      factory() {
        return 'make';
      },
      dependencies: [],
    });

    expect(await container.make('make')).toBe('make');
    expect(await container.make('build')).toBe('make');
    expect(await container.make('bar')).toBe('foo');
    expect(await container.make('foo')).toBe('foo');

    const result = await container.make('test');
    expect(result).toBeInstanceOf(Date);
    expect(await container.make('test')).toEqual(result);
  });

  it('Test async creater', async () => {
    const container = new Container();
    async function makeFoo() {
      return Promise.resolve('foo');
    }
    container.bind('foo', async () => {
      const foo = await makeFoo();
      return foo;
    }, []);

    const foo = await container.make('foo');
    expect(foo).toBe('foo');
  });
});
