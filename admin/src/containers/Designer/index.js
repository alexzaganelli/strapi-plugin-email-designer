/*
 *
 * Designer
 *
 */

import React, { useState, useEffect, memo, useRef } from 'react';
import { Button, Textarea } from '@buffetjs/core';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import { BackHeader, InputText, useGlobalContext, request } from 'strapi-helper-plugin';

import EmailEditor from 'react-email-editor';
import styled from 'styled-components';
import pluginId from '../../pluginId';
import getTrad from '../../utils/getTrad';
import TabsNav from '../../components/Tabs';

const DesignerContainer = styled.div`
  padding: 18px 30px;
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
`;

const Bar = styled.div`
  flex: 1;
  /* background-color: #dedede; */
  color: #000;
  padding: 0 0 20px 0;
  display: flex;
  max-height: 60px;
  justify-content: space-between;

  h1 {
    flex: 1;
    font-size: 16px;
    text-align: left;
  }
`;

const EmailDesigner = () => {
  const history = useHistory();
  const { templateId } = useParams();

  const emailEditorRef = useRef(null);
  const [templateData, setTemplateData] = useState();
  const [enablePrompt, togglePrompt] = useState(false);
  const [bodyText, setBodyText] = useState('');

  const [mode, setMode] = useState('html');
  const { formatMessage } = useGlobalContext();

  useEffect(() => {
    if (!emailEditorRef.current || templateId === '' || templateId === 'new') return;

    (async () => {
      const _templateData = await request(`/${pluginId}/templates/${templateId}`, { method: 'GET' });
      setTemplateData(_templateData);
      setBodyText(_templateData.bodyText);
      emailEditorRef.current?.editor?.loadDesign(_templateData.design);
    })();
  }, [templateId]);

  const saveDesign = () => {
    emailEditorRef.current.editor.exportHtml(async (data) => {
      const { design, html } = data;

      try {
        // strapi.lockAppWithOverlay();
        const response = await request(`/${pluginId}/templates/${templateId}`, {
          method: 'POST',
          body: {
            name: templateData?.name || formatMessage({ id: getTrad('noName') }),
            design,
            bodyText,
            bodyHtml: html,
          },
        });

        strapi.notification.toggle({
          type: 'success',
          message: { id: getTrad('notification.success.submit') },
        });
        togglePrompt(false);

        if (templateId === 'new' && templateId !== response.id)
          history.replace(`/plugins/${pluginId}/design/${response.id}`);
      } catch (err) {
        console.error(err);
        strapi.notification.toggle({
          type: 'warning',
          message: { id: 'notification.error' },
        });
      }
    });
  };

  const onDesignLoad = () => {
    // eslint-disable-next-line no-unused-vars
    emailEditorRef.current.editor.addEventListener('design:updated', (data) => {
      /*
      let { type, item, changes } = data;
      console.log("design:updated", type, item, changes);
      */
      togglePrompt(true);
    });
  };

  const onLoadHandler = () => {
    // ⬇︎ workaround to avoid firing onLoad api before setting the editor ref
    setTimeout(() => {
      emailEditorRef.current?.editor?.addEventListener('onDesignLoad', onDesignLoad);

      if (templateData) emailEditorRef.current.editor.loadDesign(templateData.design);
    }, 500);
  };

  return (
    <>
      <BackHeader onClick={history.goBack} />
      <DesignerContainer className="container-fluid">
        <Prompt message={formatMessage({ id: getTrad('prompt.unsaved') })} when={enablePrompt} />
        <>
          <Bar>
            <InputText
              // error={formErrors[input.name]}
              name="name"
              onChange={({ target: { value } }) => {
                setTemplateData((state) => ({ ...state, name: value }));
              }}
              placeholder={getTrad('templateNameInputField')}
              type="text"
              value={templateData?.name || ''}
              style={{ marginTop: 0, width: '50%' }}
            />
            <Button onClick={saveDesign} color="success">{formatMessage({ id: getTrad('designer.action.saveTemplate') })}</Button>
          </Bar>

          <TabsNav
            links={[
              {
                isActive: mode === 'html',
                name: getTrad('designer.version.html'),
                onClick: () => setMode('html'),
              },
              {
                isActive: mode === 'text',
                name: getTrad('designer.version.text'),
                onClick: () => setMode('text'),
              },
            ]}
            style={{ marginTop: '0.4rem', height: '5rem' }}
          />
          <div style={{ height: '100%', display: mode === 'html' ? 'flex' : 'none' }}>
            <React.StrictMode>
              <EmailEditor
                ref={emailEditorRef}
                onLoad={onLoadHandler}
                style={{
                  border: '1px solid #dedede',
                }}
                appearance={{
                  minWidth: '100%',
                  theme: 'light',
                }}
                locale={ strapi.currentLanguage }
                tools={{
                  image: {
                    enabled: true,
                    properties: {
                      src: {
                        value: {
                          url: `https://picsum.photos/600/350`,
                        },
                      },
                    },
                  },
                }}
              />
            </React.StrictMode>
          </div>
          <div style={{ display: mode === 'text' ? 'block' : 'none' }}>
            <Textarea name="textarea" onChange={({ target: { value } }) => setBodyText(value)} value={bodyText} />
          </div>
        </>
      </DesignerContainer>
    </>
  );
};

export default memo(EmailDesigner);
