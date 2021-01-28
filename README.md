# Strapi email designer plugin 💅

<p align="left">
  <a href="https://www.npmjs.org/package/strapi-plugin-email-designer">
    <img src="https://img.shields.io/npm/v/strapi-plugin-email-designer.svg?style=plastic" alt="NPM Version" /></a>
  <a href="https://www.npmjs.org/package/strapi-plugin-email-designer">
    <img src="https://img.shields.io/npm/dt/strapi-plugin-email-designer.svg?style=plastic" alt="Monthly download on NPM" /></a>
  <a href="https://github.com/prettier/prettier" target="_blank" rel="noopener noreferrer">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=plastic"></a>
  <a href="#-contributing">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=plastic" alt="PRs welcome!" /></a>
  <a href="#-license">
    <img src="https://img.shields.io/github/license/alexzaganelli/strapi-plugin-email-designer?style=plastic" alt="License" /></a>
  <a href="https://twitter.com/intent/follow?screen_name=alexzaganelli" target="_blank" rel="noopener noreferrer">
    <img alt="Follow Alex Zaganelli" src="https://img.shields.io/twitter/follow/alexzaganelli?color=%231DA1F2&label=follow%20me&style=plastic"></a>
  <a href="#">
    <img alt="Repo stars" src="https://img.shields.io/github/stars/alexzaganelli/strapi-plugin-email-designer?color=white&label=Github&style=plastic"></a>
</p>

Design your own email templates directly from the [Strapi CMS](https://github.com/strapi/strapi) admin panel and use the magic to send programmatically email from your controllers / services.

<img src="https://raw.githubusercontent.com/alexzaganelli/strapi-plugin-email-designer/main/public/assets/designer-screenshot.jpg" alt="Designer screenshot" />

_Visual composer provided by [Unlayer](https://unlayer.com/)_

&nbsp;

## ⏳ Installation

Install Strapi with this **Quickstart** command to create a Strapi project instantly:

- (Use **yarn** to install the Strapi project (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
# with yarn
yarn create strapi-app my-project --quickstart

# with npm/npx
npx create-strapi-app my-project --quickstart
```

_This command generates a brand new project with the default features (authentication, permissions, content management, content type builder & file upload). The **Quickstart** command installs Strapi using a **SQLite** database which is used for prototyping in development._

- Add the `strapi-designer` plugin

```bash
yarn add strapi-plugin-email-designer@latest

# or

npm i -S strapi-plugin-email-designer@latest
```

- After successful installation you've to build a fresh package that includes plugin UI. To archive that simply use:

```bash
yarn build && yarn develop

# or

npm run build && npm run develop
```

- or just run Strapi in the development mode with `--watch-admin` option:

```bash
yarn develop --watch-admin

#or

npm run develop --watch-admin
```

The **Email Designer** plugin should appear in the **Plugins** section of Strapi sidebar after you run app again.

## 💄 Usage

1. Design your template with easy on the visual composer

2. Send email programmatically:

```javascript
{
  // ...

  const templateId = "[GET_THE_TEMPLATE_ID]",
    to = "jhon@doe.com",
    from = "me@example.com",
    replyTo = "no-reply@example.com",
    subject = "[TEST] This is a test using strapi-email-designer",
    userData = {
      firstname: "Alex",
      lastname: "Zaganelli",
      email: "blah@blah.com",
    };

  try {
    await strapi.plugins["email-designer"].services.email.send({
      templateId,
      to,
      from,
      replyTo,
      subject,
      data: userData,
    });
  } catch (err) {
    strapi.log.debug("📺: ", err);
    return ctx.badRequest(null, err);
  }

  // ...
}
```

3. or simply get the composed body mail

```javascript
{
  // ...

  const templateId = "[GET_THE_TEMPLATE_ID]",
    userData = {
      firstname: "Alex",
      lastname: "Zaganelli",
      email: "blah@blah.com",
    };

  const { composedHtml, composedText } = await strapi.plugins["email-designer"].services.email.compose({
    templateId,
    data: userData,
  });

  // ...
}
```

**Enjoy 🎉**

## 🖐 Requirements

Complete installation requirements are exact same as for Strapi itself and can be found in the documentation under <a href="https://strapi.io/documentation/v3.x/installation/cli.html#step-1-make-sure-requirements-are-met">Installation Requirements</a>.

**Supported Strapi versions**:

- Strapi v3.4.x

(This plugin may work with the older Strapi versions, but these are not tested nor officially supported at this time.)

**Node / NPM versions**:

- NodeJS >= 12.10 <= 14
- NPM >= 6.x

**We recommend always using the latest version of Strapi to start your new projects**.

## 🚧 Roadmap

- [x] Template composer helper
- [ ] Import design functionality
- [ ] Override Strapi's core email system
- [ ] Preview email with real data
- [ ] Tags functionality
- [ ] Custom components extension
- [ ] Complete UI tests
- [ ] i18n translations

## 🤝 Contributing

Feel free to fork and make a Pull Request to this plugin project. All the input is warmly welcome!

## ⭐️ Show your support

Give a star if this project helped you.
You can also [offer me a beer](https://www.paypal.me/alexzaganelli/10) 🍻.

## 🔗 Links

- [NPM package](https://www.npmjs.com/package/strapi-plugin-email-designer)
- [GitHub repository](https://github.com/alexzaganelli/strapi-plugin-email-designer)

## 🌎 Community support

- For general help using Strapi, please refer to [the official Strapi documentation](https://strapi.io/documentation/).
- Strapi Slack [channel](https://slack.strapi.io/)
- You can DM me on [Twitter](https://twitter.com/alexzaganelli)

## 📝 License

[MIT License](LICENSE.md) Copyright (c) 2020 [Alex Zaganelli](https://alexzaganelli.com/) &amp; [Strapi Solutions](https://strapi.io/).
