const ServiceProvider = require('./ServiceProvider');

class DeferServiceProvider extends ServiceProvider {
  constructor(app) {
    super(app);
    this.defer = true;
  }
}

module.exports = DeferServiceProvider;
