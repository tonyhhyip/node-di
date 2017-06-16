'use strict';

/* global jasmine, describe, it, expect, beforeEach, */

const EventEmitter = require('events').EventEmitter;
const Container = require('./Container');

describe('Container Test', function () {

	it('Test export', function () {
		expect(typeof Container).toBe('function');
		expect(Container.name).toBe('Container');
	});

	it('Test constructor', function () {
		const instance = expect(new Container());
		instance.toBeInstanceOf(Container);
		instance.toBeInstanceOf(EventEmitter);
		expect('alias' in instance).toBeTruthy();

		expect(Container()).toBeInstanceOf(Container);
	});

	it('Test instance method', function () {
		const container = new Container();
		const abstract = 'test';
		const instance = 'Testing';
		container.instance(abstract, instance);

		expect(container.instances[abstract]).toEqual(instance);

	});

	it('Test forgetInstances method', function () {
		const container = new Container();
		const abstract = 'test';
		container.instances[abstract] = 'Testing';
		container.instances['foo'] = 'bar';

		container.forgetInstances();
	});

	it('Test forgetInstance method', function () {
		const container = new Container();
		const abstract = 'test';
		container.instances[abstract] = 'Testing';
		container.instances['foo'] = 'bar';

		container.forgetInstance('foo');
	});

	it('Test alias method', function () {
		const container = new Container();
		container.alias('foo', 'bar');

		expect(container.aliases.get('foo')).toBe('bar');
	});

	it('Test isAlias method', function () {
		const container = new Container();
		container.aliases.set('foo', 'bar');

		expect(container.isAlias('foo')).toBe(true);
		expect(container.isAlias('bar')).toBe(false);
	});

	it('Test getAlias method', function () {
		const container = new Container();
		container.aliases.set('foo', 'bar');

		expect(container.getAlias('foo')).toEqual('bar');
		expect(container.getAlias('bar')).toEqual('bar');
	});

	it('Test flush method', function () {
		const container = new Container();
		container.aliases.set('foo', 'bar');
		container.instances['bar'] = 'foo';
		container.bindings['test'] = {
			shared: false,
			builder() {return null;}
		};

		container.flush();
	});

	it('Test bind function', function () {
		function builder() {return null;}
		const container = new Container();
		container.bind('foo', builder);

		expect(container.bindings['foo']).toEqual({builder, shared: false})
	});

	it('Test singleton function', function () {
		function builder() {return null;}
		const container = new Container();
		container.singleton('foo', builder);

		expect(container.bindings['foo']).toEqual({builder, shared: true})
	});

	it('Test make function', function () {
		const container = new Container();
		container.aliases.set('foo', 'bar');
		container.aliases.set('build', 'make');
		container.instances['bar'] = 'foo';
		container.bindings['test'] = {
			shared: true,
			builder() {
				return new Date();
			}
		};

		container.bindings['make'] = {
			shared: false,
			builder() {
				return 'make';
			}
		};

		expect(container.make('make')).toBe('make');
		expect(container.make('build')).toBe('make');
		expect(container.make('bar')).toBe('foo');
		expect(container.make('foo')).toBe('foo');

		const result = container.make('test');
		expect(result).toBeInstanceOf(Date);
		expect(container.make('test')).toEqual(result);
	});
});