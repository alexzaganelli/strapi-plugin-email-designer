# Contributing

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project.

## Development Workflow

To get started with the project, make sure you have a local instance of Strapi running.
See the [Strapi docs](https://github.com/strapi/strapi#getting-started) on how to setup a Strapi project.

#### 1. Fork the [repository](https://github.com/alexzaganelli/strapi-plugin-email-designer)

[Go to the repository](https://github.com/alexzaganelli/strapi-plugin-email-designer) and fork it to your own GitHub account.

#### 2. Clone from your repository into the plugins folder

```bash
cd YOUR_STRAPI_PROJECT/src/plugins
git clone git@github.com:YOUR_USERNAME/strapi-plugin-email-designer.git email-designer
```

#### 3. Install the dependencies

Go to the plugin and install it's dependencies.

```bash
cd YOUR_STRAPI_PROJECT/src/plugins/email-designer/ && yarn plugin:install
```

#### 4. Enable the plugin

Add the following lines to the `config/plugins.js` file in your Strapi project.

```
const path = require('path');
// ...
{
  'email-designer': {
    enabled: true,
    resolve: path.resolve(__dirname, '../src/plugins/email-designer'),
  },
}
```

#### 5. Rebuild your Strapi project

Rebuild your strapi project to build the admin part of the plugin.

```bash
cd YOUR_STRAPI_PROJECT && yarn build --clean
```

#### 6. Running the administration panel in development mode

**Start the administration panel server for development**

```bash
cd YOUR_STRAPI_PROJECT && yarn develop --watch-admin
```

The administration panel will be available at http://localhost:8080/admin

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, eg add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

### Linting and tests

[ESLint](https://eslint.org/)

We use [ESLint](https://eslint.org/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn eslint`: lint files with ESLint.
- `yarn eslint:fix`: auto-fix ESLint issues.
- `yarn test:unit`: run unit tests with Jest.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
