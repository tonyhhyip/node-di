'use strict';

const util = require('util');
const ServiceProvider = require('./ServiceProvider');

function DeferServiceProvider(app) {
  if (!(this instanceof DeferServiceProvider)) {
    return new DeferServiceProvider();
  }

  ServiceProvider.call(this, app);
  this.defer = true;
}

util.inherits(DeferServiceProvider, ServiceProvider);

module.exports = DeferServiceProvider;
