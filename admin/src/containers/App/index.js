import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from 'strapi-helper-plugin';

// Utils
import { Fonts } from '@buffetjs/styles';
import styled from 'styled-components';
import pluginId from '../../pluginId';

// Containers
import HomePage from '../HomePage';
import HowToPage from '../HowToPage';
import Designer from '../Designer';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const App = () => {
  return (
    <Container>
      <Fonts />
      {/* <GlobalStyle /> */}

      <Switch>
        <Route path={`/plugins/${pluginId}`} component={HomePage} exact />
        <Route path={`/plugins/${pluginId}/how-to`} component={HowToPage} exact />
        <Route path={`/plugins/${pluginId}/design/:templateId`} component={() => <Designer />} exact />
        <Route path={`/plugins/${pluginId}/core/:coreMessageType`} component={() => <Designer isCore />} exact />
        <Route component={NotFound} />
      </Switch>
    </Container>
  );
};

export default App;
