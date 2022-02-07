'use strict';

const services = require('./services');
const routes = require('./routes');
const controllers = require('./controllers');
const contentTypes = require('./content-types');

module.exports = {
  contentTypes,
  controllers,
  routes,
  services
};
