"use strict";
const _ = require("lodash");

/**
 * email-designer.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

module.exports = {
  /**
   * Promise to count templates
   *
   * @return {Promise}
   */

  count(params) {
    return strapi.query("email-template", "email-designer").count(params);
  },

  /**
   * Promise to search count templates
   *
   * @return {Promise}
   */

  countSearch(params) {
    return strapi.query("email-template", "email-designer").countSearch(params);
  },

  /**
   * Promise to add a template.
   * @return {Promise}
   */
  async add(values) {
    return strapi.query("email-template", "email-designer").create(values);
  },

  /**
   * Promise to edit a template.
   * @return {Promise}
   */
  async edit(params, values) {
    return strapi.query("email-template", "email-designer").update(params, values);
  },

  /**
   * Promise to fetch a template.
   * @return {Promise}
   */
  fetch(params, populate) {
    return strapi.query("email-template", "email-designer").findOne(params, populate);
  },

  /**
   * Promise to fetch all templates.
   * @return {Promise}
   */
  fetchAll(params, populate) {
    return strapi.query("email-template", "email-designer").find(params, populate);
  },

  /**
   * Promise to remove a template.
   * @return {Promise}
   */
  async remove(params) {
    return strapi.query("email-template", "email-designer").delete(params);
  },
};
