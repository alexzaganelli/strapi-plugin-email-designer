"use strict";

/**
 * email-designer.js email service
 */

const _ = require("lodash");
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const isValidEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  /**
   * Promise to retrieve a composed HTML email.
   * @return {Promise}
   */
  async compose({ templateId, data }) {
    if (!templateId) throw new Error("No email template's id provided");
    let composedHtml, composedText;
    try {
      const template = await strapi.query("email-template", "email-designer").findOne({ id: templateId });
      composedHtml = _.template(template.bodyHtml)({ ...data });
      composedText = _.template(template.bodyText)({ ...data });
    } catch (error) {
      strapi.log.debug(error);
      throw new Error("Email template not found with id: " + templateId);
    }

    return { composedHtml, composedText };
  },

  /**
   * Promise to send a composed HTML email.
   * @return {Promise}
   */
  async send({ templateId, data, to, from, replyTo, subject }) {
    Object.entries({ to, from, replyTo }).forEach(([key, address]) => {
      if (!isValidEmail.test(address)) throw new Error(`Invalid "${key}" email address with value "${address}"`);
    });

    try {
      const { composedHtml = "", composedText = "" } = await strapi.plugins["email-designer"].services.email.compose({
        templateId,
        data,
      });

      await strapi.plugins["email"].services.email.send({
        to,
        from,
        replyTo,
        subject,
        html: composedHtml,
        text: composedText,
      });
    } catch (err) {
      strapi.log.debug(`📺: `, err);
      throw new Error(err);
    }
  },
};
