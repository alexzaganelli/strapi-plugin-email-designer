'use strict';

/**
 * email-designer.js email service
 */

const _ = require('lodash');
const isValidEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const decode = require('decode-html');
const { htmlToText } = require('html-to-text');
const { isEmpty } = require('lodash');

const { mantainLegacyTemplate = true } = (strapi.plugins['email-designer'] || {}).config || {};

_.templateSettings.evaluate = /\{\{(.+?)\}\}/g;
_.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
_.templateSettings.escape = /\{\{-(.+?)\}\}/g;

/**
 * fill subject, text and html using lodash template
 * @param {object} emailOptions - to, from and replyto...
 * @param {object} emailTemplate - object containing attributes to fill
 * @param {object} data - data used to fill the template
 * @returns {{ subject, text, subject }}
 */
const sendTemplatedEmail = async (emailOptions = {}, emailTemplate = {}, data = {}) => {
  Object.entries(emailOptions).forEach(([key, address]) => {
    if (Array.isArray(address)) {
      address.forEach((email) => {
        if (!isValidEmail.test(email)) throw new Error(`Invalid "${key}" email address with value "${email}"`);
      });
    } else {
      if (!isValidEmail.test(address)) throw new Error(`Invalid "${key}" email address with value "${address}"`);
    }
  });

  const requiredAttributes = ['templateId'];
  const attributes = ['text', 'html', 'subject'];
  const missingAttributes = _.difference(requiredAttributes, Object.keys(emailTemplate));
  if (missingAttributes.length > 0) {
    throw new Error(`Following attributes are missing from your email template : ${missingAttributes.join(', ')}`);
  }

  let { bodyHtml, bodyText, subject } = await strapi
    .query('email-template', 'email-designer')
    .findOne({ id: emailTemplate.templateId });

  if (mantainLegacyTemplate) {
    bodyHtml = bodyHtml.replace(/<%/g, '{{').replace(/%>/g, '}}');
    bodyText = bodyText.replace(/<%/g, '{{').replace(/%>/g, '}}');
    subject = subject.replace(/<%/g, '{{').replace(/%>/g, '}}');
  }

  if ((!bodyText || !bodyText.length) && bodyHtml && bodyHtml.length)
    bodyText = htmlToText(bodyHtml, { wordwrap: 130, trimEmptyLines: true, uppercaseHeadings: false });

  emailTemplate = {
    ...emailTemplate,
    subject:
      (!isEmpty(emailTemplate.subject) && emailTemplate.subject) ||
      (!isEmpty(subject) && decode(subject)) ||
      'No Subject',
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

/**
 * @Deprecated
 * Promise to retrieve a composed HTML email.
 * @return {Promise}
 */
const compose = async ({ templateId, data }) => {
  strapi.log.debug(`⚠️: `, `The 'compose' function is deprecated and may be removed or changed in the future.`);

  if (!templateId) throw new Error("No email template's id provided");
  let composedHtml, composedText, composedSubject;
  try {
    let { bodyHtml, bodyText } = await strapi.query('email-template', 'email-designer').findOne({ id: templateId });

    if (mantainLegacyTemplate) {
      bodyHtml = bodyHtml.replace(/<%/g, '{{').replace(/%>/g, '}}');
      bodyText = bodyText.replace(/<%/g, '{{').replace(/%>/g, '}}');
    }

    composedHtml = _.template(decode(bodyHtml))({ ...data });
    composedText = _.template(decode(bodyText))({ ...data });
  } catch (error) {
    strapi.log.debug(error);
    throw new Error('Error composing the email:\n' + error + '\nTemplate ID: ' + templateId);
  }

  return { composedHtml, composedText };
};

/**
 * @Deprecated
 * Promise to send a composed HTML email.
 * @return {Promise}
 */
const send = async ({ templateId, data, to, from, replyTo, subject }) => {
  strapi.log.debug(`⚠️: `, `The 'send' function is deprecated and may be removed or changed in the future.`);

  Object.entries({ to, from, replyTo }).forEach(([key, address]) => {
    if (!isValidEmail.test(address)) throw new Error(`Invalid "${key}" email address with value "${address}"`);
  });

  try {
    const { composedHtml = '', composedText = '' } = await strapi.plugins['email-designer'].services.email.compose({
      templateId,
      data,
    });

    await strapi.plugins['email'].services.email.send({
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
};

module.exports = {
  sendTemplatedEmail,
  compose,
  send,
};
