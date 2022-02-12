'use strict';

/**
 * email-designer.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = ({ strapi }) => {
  return {
    /**
     * Promise to fetch a template.
     * @return {Promise}
     */
    findOne(params) {
      return strapi.query('plugin::email-designer.email-template').findOne({ where: params });
    },

    /**
     * Promise to fetch all templates.
     * @return {Promise}
     */
    findMany(params) {
      return strapi.query('plugin::email-designer.email-template').findMany({ where: params });
    },

    /**
     * Promise to add a template.
     * @return {Promise}
     */
    async create(values) {
      return strapi.query('plugin::email-designer.email-template').create({ data: values });
    },

    /**
     * Promise to edit a template.
     * @return {Promise}
     */
    async update(params, values) {
      // FIXME: ⬇︎ avoid duplicating templateReferenceId field
      return strapi.query('plugin::email-designer.email-template').update({ where: params, data: values });
    },

    /**
     * Promise to remove a template.
     * @return {Promise}
     */
    async delete(params) {
      return strapi.query('plugin::email-designer.email-template').delete({ where: params });
    },
  };
};
