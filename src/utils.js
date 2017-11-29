module.exports = function (constructor, ...parameter) {
  return Reflect.construct(constructor, parameter);
};
