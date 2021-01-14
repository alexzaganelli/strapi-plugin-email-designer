"use strict";
const _ = require("lodash");

/**
 * email-designer.js controller
 *
 * @description: A set of functions called "actions" of the `email-designer` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: "ok",
    });
  },
  /**
   * Get template design action.
   *
   * @return {Object}
   */
  getTemplates: async (ctx) => {
    const templates = await strapi.plugins["email-designer"].services.template.fetchAll();
    ctx.send(templates);
  },
  /**
   * Get template design action.
   *
   * @return {Object}
   */
  getTemplate: async (ctx) => {
    const template = await strapi.plugins["email-designer"].services.template.fetch({ id: ctx.params.templateId });
    ctx.send(template);
  },

  /**
   * Delete template design action.
   *
   * @return {Object}
   */
  deleteTemplate: async (ctx) => {
    const template = await strapi.plugins["email-designer"].services.template.remove({ id: ctx.params.templateId });
    ctx.send({ removed: true });
  },

  /**
   * Save template design action.
   *
   * @return {Object}
   */
  saveTemplate: async (ctx) => {
    const template =
      _.isEmpty(ctx.params.templateId) || ctx.params.templateId === "new"
        ? await strapi.plugins["email-designer"].services.template.add(ctx.request.body)
        : await strapi.plugins["email-designer"].services.template.edit(
            { id: ctx.params.templateId },
            { ...ctx.request.body, id: ctx.params.templateId }
          );
    ctx.send(template);
  },

  /**
   * Duplicate a template.
   *
   * @return {Object}
   */
  duplicateTemplate: async (ctx) => {
    if (_.isEmpty(ctx.params.sourceTemplateId)) return ctx.badRequest("No source template Id given");

    const { __v, _id, id, updatedAt, createdAt, ...toClone } = await strapi
      .query("email-template", "email-designer")
      .findOne({ id: ctx.params.sourceTemplateId });

    return toClone ? strapi.query("email-template", "email-designer").create({ ...toClone, name: `${toClone.name} copy` }) : null;
  },
};
