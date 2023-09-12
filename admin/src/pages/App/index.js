import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AnErrorOccurred } from '@strapi/helper-plugin';

// Utils
import styled from 'styled-components';
import pluginId from '../../pluginId';

// Pages
import HomePage from '../HomePage';
import Designer from '../Designer';
import HowToPage from '../HowToPage';

const App = () => {
  const PluginViewWrapper = styled.div`
    min-height: 100vh;
  `;

  return (
    <PluginViewWrapper>
      <Switch>
        <Route path={`/plugins/${pluginId}`} component={HomePage} exact />
        <Route path={`/plugins/${pluginId}/design/:templateId`} component={() => <Designer />} exact />
        <Route path={`/plugins/${pluginId}/core/:coreEmailType`} component={() => <Designer isCore />} exact />
        <Route path={`/plugins/${pluginId}/how-to`} component={HowToPage} exact />
        <Route component={AnErrorOccurred} />
      </Switch>
    </PluginViewWrapper>
  );
};

export default App;
