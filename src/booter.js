

const debug = require('debug')('node-di:boot');

module.exports = function boot(object) {
  const constructor = resolveConstructor(object);
  const classes = resolveClasses(constructor);

  if ('boot' in object) {
    debug('Run boot method');
    object.boot();
  }

  classes.forEach((builder) => {
    debug('Find [%s] is super class of [%s]', builder, constructor.name);
    const method = `boot${ucfirst(builder.name)}`;
    if (method in object) {
      debug(`Call method ${method} of ${object}`);
      object[method]();
    }
  });
};

function resolveConstructor(object) {
  debug('Resolve constructor for %s', object);
  if ('constructor' in object) {
    return object.constructor;
  } else if ('constructor' in object.prototype) {
    return object.prototype.constructor;
  }
  return null;
}

function resolveClasses(constructor) {
  debug('Resolve super class for %s', constructor.name);
  const classes = new Set();
  classes.add(constructor.name);
  let child = constructor;
  while ('super_' in child) {
    classes.add(child.name);
    child = child.super_;
  }
  return classes;
}
function ucfirst(str) {
  const string = String(str);
  return `${string.charAt(0).toUpperCase()}${string.substring(1)}`;
}
