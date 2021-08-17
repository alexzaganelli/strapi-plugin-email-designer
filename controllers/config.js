'use strict';

const { pick } = require('lodash');

module.exports = {
  getConfig: async (ctx) => {
    const config = strapi.plugins['email-designer'].services.config.getConfig();
    ctx.send({
      config: pick(config, ['editor']),
    });
  },
};
