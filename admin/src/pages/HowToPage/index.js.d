import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
// import { Header } from '@buffetjs/custom';
import { BaseHeaderLayout } from '@strapi/design-system/Layout';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import sunburst from 'react-syntax-highlighter/dist/esm/styles/prism/material-dark';

import getMessage from '../../utils/getMessage';

const HowToPage = () => {
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
    <>
      <div className="container-fluid" style={{ padding: '18px 30px 66px 30px' }}>
        <Box background="neutral100">
          <BaseHeaderLayout
            navigationAction={
              <Link startIcon={<ArrowLeft />} to="/">
                Go back
              </Link>
            }
            // primaryAction={<Button startIcon={<Plus />}>Add an entry</Button>}
            // secondaryAction={
            //   <Button variant="tertiary" startIcon={<Pencil />}>
            //     Edit
            //   </Button>
            // }
            title={getTrad('howToUse')}
            // subtitle="36 entries found"
            as="h2"
          />
        </Box>
        {/* <Header
          title={{
            label: ,
          }}
          content={getTrad('howToUse.content') })}
        /> */}
        <SyntaxHighlighter language="javascript" style={sunburst}>
          {exampleCode}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default memo(HowToPage);
