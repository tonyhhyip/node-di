

/* global describe, it, expect */

const EventEmitter = require('events').EventEmitter;
const Container = require('./Container');

describe('Container Test', () => {
  it('Test export', () => {
    expect(typeof Container).toBe('function');
    expect(Container.name).toBe('Container');
  });

  it('Test constructor', () => {
    const container = new Container();
    const instance = expect(container);
    instance.toBeInstanceOf(Container);
    instance.toBeInstanceOf(EventEmitter);
    expect('alias' in container).toBeTruthy();

    expect(Container()).toBeInstanceOf(Container);
  });

  it('Test instance method', () => {
    const container = new Container();
    const abstract = 'test';
    const instance = 'Testing';
    container.instance(abstract, instance);

    expect(container.instances[abstract]).toEqual(instance);
  });

  it('Test forgetInstances method', () => {
    const container = new Container();
    const abstract = 'test';
    container.instances[abstract] = 'Testing';
    container.instances.foo = 'bar';

    container.forgetInstances();
  });

  it('Test forgetInstance method', () => {
    const container = new Container();
    const abstract = 'test';
    container.instances[abstract] = 'Testing';
    container.instances.foo = 'bar';

    container.forgetInstance('foo');
  });

  it('Test alias method', () => {
    const container = new Container();
    container.alias('foo', 'bar');

    expect(container.aliases.get('foo')).toBe('bar');
  });

  it('Test isAlias method', () => {
    const container = new Container();
    container.aliases.set('foo', 'bar');

    expect(container.isAlias('foo')).toBe(true);
    expect(container.isAlias('bar')).toBe(false);
  });

  it('Test getAlias method', () => {
    const container = new Container();
    container.aliases.set('foo', 'bar');

    expect(container.getAlias('foo')).toEqual('bar');
    expect(container.getAlias('bar')).toEqual('bar');
  });

  it('Test flush method', () => {
    const container = new Container();
    container.aliases.set('foo', 'bar');
    container.instances.bar = 'foo';
    container.bindings.test = {
      shared: false,
      builder() { return null; },
    };

    container.flush();
  });

  it('Test bind function', () => {
    function builder() { return null; }
    const container = new Container();
    container.bind('foo', builder);

    expect(container.bindings.foo).toEqual({ builder, shared: false });
  });

  it('Test singleton function', () => {
    function builder() { return null; }
    const container = new Container();
    container.singleton('foo', builder);

    expect(container.bindings.foo).toEqual({ builder, shared: true });
  });

  it('Test make function', async () => {
    const container = new Container();
    container.aliases.set('foo', 'bar');
    container.aliases.set('build', 'make');
    container.instances.bar = 'foo';
    container.bindings.test = {
      shared: true,
      builder() {
        return new Date();
      },
    };

    container.bindings.make = {
      shared: false,
      builder() {
        return 'make';
      },
    };

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
    });

    const foo = await container.make('foo');
    expect(foo).toBe('foo');
  });
});
