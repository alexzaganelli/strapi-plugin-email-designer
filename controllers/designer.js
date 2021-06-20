'use strict';
const _ = require('lodash');
const { htmlToText } = require('html-to-text');

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
      message: 'ok',
    });
  },
  /**
   * Get template design action.
   *
   * @return {Object}
   */
  getTemplates: async (ctx) => {
    const templates = await strapi.plugins['email-designer'].services.template.fetchAll();
    ctx.send(templates);
  },
  /**
   * Get template design action.
   *
   * @return {Object}
   */
  getTemplate: async (ctx) => {
    const template = await strapi.plugins['email-designer'].services.template.fetch({ id: ctx.params.templateId });
    ctx.send(template);
  },

  /**
   * Delete template design action.
   *
   * @return {Object}
   */
  deleteTemplate: async (ctx) => {
    const template = await strapi.plugins['email-designer'].services.template.remove({ id: ctx.params.templateId });
    ctx.send({ removed: true });
  },

  /**
   * Save template design action.
   *
   * @return {Object}
   */
  saveTemplate: async (ctx) => {
    if (!_.isEmpty(ctx.params.templateId) && ctx.request.body.import) {
      const foundTemplate = await strapi.plugins['email-designer'].services.template.fetch({
        id: ctx.params.templateId,
      });
      if (!foundTemplate || foundTemplate.name !== ctx.request.body.name) ctx.params.templateId = 'new';
    }

    const template =
      _.isEmpty(ctx.params.templateId) || ctx.params.templateId === 'new'
        ? await strapi.plugins['email-designer'].services.template.add(ctx.request.body)
        : await strapi.plugins['email-designer'].services.template.edit(
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
    if (_.isEmpty(ctx.params.sourceTemplateId)) return ctx.badRequest('No source template Id given');

    const { __v, _id, id, updatedAt, createdAt, ...toClone } = await strapi
      .query('email-template', 'email-designer')
      .findOne({ id: ctx.params.sourceTemplateId });

    return toClone
      ? strapi.query('email-template', 'email-designer').create({ ...toClone, name: `${toClone.name} copy` })
      : null;
  },

  /**
   * Strapi's core templates
   */

  /**
   * Get strapi's core message template action.
   *
   * @return {Object}
   */
  getcoreMessageType: async (ctx) => {
    // const { coreMessageType } = ctx.query;
    const { coreMessageType } = ctx.params;

    if (!['user-address-confirmation', 'reset-password'].includes(coreMessageType))
      return ctx.badRequest('No valid core message key');

    const pluginStoreEmailKey =
      coreMessageType === 'user-address-confirmation' ? 'email_confirmation' : 'reset_password';

    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    let data = await pluginStore.get({ key: 'email' }).then((storeEmail) => storeEmail[pluginStoreEmailKey]);

    data = {
      ...data,
      coreMessageType,
      ...(data && data.options
        ? {
            subject: data.options.object.replace(/<%|&#x3C;%/g, '{{').replace(/%>|%&#x3E;/g, '}}'),
            bodyHtml: data.options.message.replace(/<%|&#x3C;%/g, '{{').replace(/%>|%&#x3E;/g, '}}'),
            bodyText: htmlToText(data.options.message.replace(/<%|&#x3C;%/g, '{{').replace(/%>|%&#x3E;/g, '}}'), {
              wordwrap: 130,
              trimEmptyLines: true,
              uppercaseHeadings: false,
            }),
          }
        : {}),
    };

    ctx.send(data);
  },

  /**
   * Save strapi's core message template action.
   *
   * @return {Object}
   */
  savecoreMessageType: async (ctx) => {
    const { coreMessageType } = ctx.params;
    if (!['user-address-confirmation', 'reset-password'].includes(coreMessageType))
      return ctx.badRequest('No valid core message key');

    const pluginStoreEmailKey =
      coreMessageType === 'user-address-confirmation' ? 'email_confirmation' : 'reset_password';

    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    const emailsConfig = await pluginStore.get({ key: 'email' });

    emailsConfig[pluginStoreEmailKey] = {
      options: {
        ...(emailsConfig[pluginStoreEmailKey] ? emailsConfig[pluginStoreEmailKey].options : {}),
        message: ctx.request.body.message.replace(/{{/g, '<%').replace(/}}/g, '%>'),
        object: ctx.request.body.subject.replace(/{{/g, '<%').replace(/}}/g, '%>'),
      },
      design: ctx.request.body.design,
    };

    await pluginStore.set({ key: 'email', value: emailsConfig });

    ctx.send({ message: 'Saved' });
  },
};
