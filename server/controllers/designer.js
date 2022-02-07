'use strict';
const _ = require('lodash');
const { htmlToText } = require('html-to-text');
const { isNil } = require('lodash');

/**
 * email-designer.js controller
 *
 * @description: A set of functions called "actions" of the `email-designer` plugin.
 */

module.exports = {
  /**
   * Get template design action.
   *
   * @return {Object}
   */
  getTemplates: async (ctx) => {
    const templates = await strapi.plugin('email-designer').service('template').findMany();
    ctx.send(templates);
  },

  /**
   * Get template design action.
   *
   * @return {Object}
   */
  getTemplate: async (ctx) => {
    const template = await strapi.plugin('email-designer').service('template').findOne({ id: ctx.params.templateId });
    ctx.send(template);
  },

  /**
   * Delete template design action.
   *
   * @return {Object}
   */
  deleteTemplate: async (ctx) => {
    await strapi.plugin('email-designer').service('template').delete({ id: ctx.params.templateId });
    ctx.send({ removed: true });
  },

  /**
   * Save template design action.
   *
   * @return {Object}
   */
  saveTemplate: async (ctx) => {
    let { templateId } = ctx.params;

    const { templateReferenceId, import: importTemplate } = ctx.request.body;

    if (importTemplate === true) {
      if (!isNil(templateReferenceId)) {
        const foundTemplate = await strapi.plugin('email-designer').service('template').findOne({
          templateReferenceId,
        });

        if (!_.isEmpty(foundTemplate)) {
          if (templateId === 'new') return ctx.badRequest('Template reference ID is already taken');

          // override the existing entry with imported data
          templateId = foundTemplate.id;
        } else {
          templateId = 'new';
        }
      } else {
        templateId = 'new';
      }
    }

    try {
      const template =
        templateId === 'new'
          ? await strapi.plugin('email-designer').service('template').create(ctx.request.body)
          : await strapi.plugin('email-designer').service('template').update({ id: templateId }, ctx.request.body);

      ctx.send(template || {});
    } catch (error) {
      ctx.badRequest(null, error);
    }
  },

  /**
   * Duplicate a template.
   *
   * @return {Object}
   */
  duplicateTemplate: async (ctx) => {
    if (_.isEmpty(ctx.params.sourceTemplateId)) {
      return ctx.badRequest('No source template Id given');
    }

    const { __v, _id, id, updatedAt, createdAt, ...toClone } = await strapi
      .plugin('email-designer')
      .service('template')
      .findOne({ id: ctx.params.sourceTemplateId });

    if (toClone) {
      return strapi
        .plugin('email-designer')
        .service('template')
        .create({ ...toClone, name: `${toClone.name} copy`, templateReferenceId: null });
    }
    return null;
  },

  /**
   * Strapi's core templates
   */

  /**
   * Get strapi's core message template action.
   *
   * @return {Object}
   */
  getCoreEmailType: async (ctx) => {
    const { coreEmailTypeType } = ctx.params;
    if (!['user-address-confirmation', 'reset-password'].includes(coreEmailTypeType))
      return ctx.badRequest('No valid core message key');

    const pluginStoreEmailKey =
      coreEmailTypeType === 'user-address-confirmation' ? 'email_confirmation' : 'reset_password';

    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    let data = await pluginStore.get({ key: 'email' }).then((storeEmail) => storeEmail[pluginStoreEmailKey]);

    data = {
      ...(data && data.options
        ? {
            from: data.options.from,
            message: data.options.message,
            subject: data.options.object.replace(/<%|&#x3C;%/g, '{{').replace(/%>|%&#x3E;/g, '}}'),
            bodyHtml: data.options.message.replace(/<%|&#x3C;%/g, '{{').replace(/%>|%&#x3E;/g, '}}'),
            bodyText: htmlToText(data.options.message.replace(/<%|&#x3C;%/g, '{{').replace(/%>|%&#x3E;/g, '}}'), {
              wordwrap: 130,
              trimEmptyLines: true,
              uppercaseHeadings: false,
            }),
          }
        : {}),
      coreEmailTypeType,
      design: data.design,
    };

    ctx.send(data);
  },

  /**
   * Save strapi's core message template action.
   *
   * @return {Object}
   */
  saveCoreEmailType: async (ctx) => {
    const { coreEmailTypeType } = ctx.params;
    if (!['user-address-confirmation', 'reset-password'].includes(coreEmailTypeType))
      return ctx.badRequest('No valid core message key');

    const pluginStoreEmailKey =
      coreEmailTypeType === 'user-address-confirmation' ? 'email_confirmation' : 'reset_password';

    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    const emailsConfig = await pluginStore.get({ key: 'email' });
    const config = strapi.plugin('email-designer').services.config.getConfig();

    emailsConfig[pluginStoreEmailKey] = {
      ...emailsConfig[pluginStoreEmailKey],
      options: {
        ...(emailsConfig[pluginStoreEmailKey] ? emailsConfig[pluginStoreEmailKey].options : {}),
        message: ctx.request.body.message.replace(/{{/g, '<%').replace(/}}/g, '%>'),
        object: ctx.request.body.subject.replace(/{{/g, '<%').replace(/}}/g, '%>'),
        // TODO: from: ctx.request.from,
        // TODO: response_email: ctx.request.response_email,
      },
      design: ctx.request.body.design,
    };

    await pluginStore.set({ key: 'email', value: emailsConfig });

    ctx.send({ message: 'Saved' });
  },
};
