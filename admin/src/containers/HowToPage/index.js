import React, { memo } from 'react';
import { BackHeader, useGlobalContext } from 'strapi-helper-plugin';
import { useHistory } from 'react-router-dom';
import { Header } from '@buffetjs/custom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import sunburst from 'react-syntax-highlighter/dist/esm/styles/prism/material-dark';

import getTrad from '../../utils/getTrad';

const HowToPage = () => {
  const { formatMessage } = useGlobalContext();

  const exampleCode = `{
    const templateId = "[GET_THE_TEMPLATE_ID]",
    to = "john@doe.com",
    from = "me@example.com",
    replyTo = "no-reply@example.com",
    subject = "[TEST] This is a test using strapi-email-designer", // If provided here will override the template's subject. Can include variables like "Welcome to <%= project_name %>"
    userData = {
    firstname: "John",
    lastname: "Doe",
    email: "blah@blah.com"
    }
    
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
    strapi.log.debug('📺: ', err);
    return ctx.badRequest(null, err);
    }
}`;

  return (
    <>
      <BackHeader onClick={useHistory().goBack} />
      <div className="container-fluid" style={{ padding: '18px 30px 66px 30px' }}>
        <Header
          title={{
            label: formatMessage({ id: getTrad('howToUse') }),
          }}
          content={formatMessage({ id: getTrad('howToUse.content') })}
        />
        <SyntaxHighlighter language="javascript" style={sunburst}>
          {exampleCode}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default memo(HowToPage);
