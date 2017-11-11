module.exports = function (constructor, ...parameter) {
  try {
    const instance = Object.create(constructor.prototype);
    instance.constructor(...parameter);
    return instance;
  } catch (e) {
    return new constructor(...parameter);
  }
};
