import React, { memo } from 'react';
import { Link } from '@strapi/design-system/Link';
import { Box } from '@strapi/design-system/Box';
import { ArrowLeft } from '@strapi/icons';
import { BaseHeaderLayout } from '@strapi/design-system/Layout';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useHistory } from 'react-router-dom';
import sunburst from 'react-syntax-highlighter/dist/esm/styles/prism/material-dark';
import getMessage from '../../utils/getMessage';

const HowToPage = () => {
  const { goBack } = useHistory();

  const exampleCode = `{
    const templateId = "[GET_THE_TEMPLATE_ID]",
    to = "john@doe.com",
    from = "me@example.com",
    replyTo = "no-reply@example.com",
    subject = "[TEST] This is a test using strapi-email-designer", // If provided here will override the template's subject. Can include variables like "Welcome to {{= project_name }}"
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
    <Box background="neutral100">
      <BaseHeaderLayout
        navigationAction={
          <Link startIcon={<ArrowLeft />} to="#" onClick={goBack}>
            {getMessage('goBack')}
          </Link>
        }
        title={getMessage('howToUse')}
        subtitle={getMessage('howToUse.content')}
        as="h2"
      />

      <Box padding={10} paddingTop={0} background="neutral100" hasRadius>
        <SyntaxHighlighter
          lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
          wrapLines={true}
          language="javascript"
          style={sunburst}
        >
          {exampleCode}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};

export default memo(HowToPage);
