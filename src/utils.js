module.exports = function (constructor, ...parameter) {
	try {
		const instance = Object.create(constructor.prototype);
		instance.constructor.apply(instance, parameter);
		return instance;
	} catch (e) {
		return new constructor(...parameter);
	}
};