'use strict';

/**
 * email-designer.js email service
 */

const _ = require('lodash');
const isValidEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const decode = require('decode-html');
const { htmlToText } = require("html-to-text");

/**
 * fill subject, text and html using lodash template
 * @param {object} emailOptions - to, from and replyto...
 * @param {object} emailTemplate - object containing attributes to fill
 * @param {object} data - data used to fill the template
 * @returns {{ subject, text, subject }}
 */
const sendTemplatedEmail = async (emailOptions = {}, emailTemplate = {}, data = {}) => {
  Object.entries(emailOptions).forEach(([key, address]) => {
    if (!isValidEmail.test(address)) throw new Error(`Invalid "${key}" email address with value "${address}"`);
  });

  const requiredAttributes = ['templateId', 'subject'];
  const attributes = [...requiredAttributes, 'text', 'html'];
  const missingAttributes = _.difference(requiredAttributes, Object.keys(emailTemplate));
  if (missingAttributes.length > 0) {
    throw new Error(
      `Following attributes are missing from your email template : ${missingAttributes.join(', ')}`
    );
  }

  let { bodyHtml, bodyText } = await strapi.query('email-template', 'email-designer').findOne({ id: emailTemplate.templateId });

  if ( (!bodyText || !bodyText.length) && bodyHtml && bodyHtml.length ) bodyText = htmlToText(bodyHtml, { wordwrap: 130, trimEmptyLines: true });

  emailTemplate = {
    ...emailTemplate,
    html: decode(bodyHtml),
    text: decode(bodyText),
  };

  const templatedAttributes = attributes.reduce(
    (compiled, attribute) =>
      emailTemplate[attribute]
        ? Object.assign(compiled, { [attribute]: _.template(emailTemplate[attribute])(data) })
        : compiled,
    {}
  );

  return strapi.plugins.email.provider.send({ ...emailOptions, ...templatedAttributes });
};

module.exports = {
  sendTemplatedEmail,
};