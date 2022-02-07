'use strict';

/**
 * config.js configuration service
 */

module.exports = ({ strapi }) => {
  return {
    getConfig() {
      return strapi.plugins['email-designer'].config;
    },
  };
};
