/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
/*
 *
 * Designer
 *
 */

import React, { useState, useEffect, memo, useRef } from 'react';
import { Button, Textarea } from '@buffetjs/core';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import { BackHeader, InputText, useGlobalContext, request, auth } from 'strapi-helper-plugin';
import { isEmpty, merge } from 'lodash';
import PropTypes from 'prop-types';
import striptags from 'striptags';
import EmailEditor from 'react-email-editor';
import styled from 'styled-components';

import pluginId from '../../pluginId';
import getTrad from '../../utils/getTrad';
import TabsNav from '../../components/Tabs';
import MediaLibrary from '../../components/MediaLibrary';
import { standardEmailRegistrationTemplate } from '../../../../config/settings';

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

const userInfo = auth.getUserInfo();

const defaultEditorTools = {
  image: {
    properties: {
      src: {
        value: {
          url: `https://picsum.photos/600/350`,
        },
      },
    },
  },
};

const defaultEditorAppearance = { minWidth: '100%', theme: 'light' };
const defaultEditorOptions = { fonts: { showDefaultFonts: false } };
const currentTemplateTags = {
  mergeTags: [
    {
      name: 'User',
      mergeTags: [
        {
          name: 'First Name',
          value: '{{= USER.firstname }}',
          sample: (userInfo && userInfo.firstname) || 'John',
        },
        {
          name: 'Last Name',
          value: '{{= USER.lastname }}',
          sample: (userInfo && userInfo.lastname) || 'Doe',
        },
        {
          name: 'Email',
          value: '{{= USER.username }}',
          sample: (userInfo && userInfo.username) || 'john@doe.com',
        },
      ],
    },
  ],
  mergeTagsConfig: {
    autocompleteTriggerChar: '@',
    delimiter: ['{{=', '}}'],
  },
};

const EmailDesigner = ({ isCore = false }) => {
  const history = useHistory();
  const { templateId, coreMessageType } = useParams();

  const emailEditorRef = useRef(null);
  const [templateData, setTemplateData] = useState();
  const [enablePrompt, togglePrompt] = useState(false);
  const [bodyText, setBodyText] = useState('');

  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const [mode, setMode] = useState('html');
  const { formatMessage } = useGlobalContext();

  const [filesToUpload, setFilesToUpload] = useState({});

  const [configLoaded, setConfigLoaded] = useState(false);

  const [editorAppearance, setEditorAppearance] = useState({ ...defaultEditorAppearance });
  const [editorTools, setEditorTools] = useState({ ...defaultEditorTools });
  const [editorOptions, setEditorOptions] = useState({ ...defaultEditorOptions, ...currentTemplateTags });
  const isMounted = useRef(true);

  useEffect(() => {
    (async () => {
      setConfigLoaded(true);
    })();

    return () => {
      // release react-email-editor on unmount
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (
      !emailEditorRef.current ||
      (!templateId && !coreMessageType) ||
      (coreMessageType && !['user-address-confirmation', 'reset-password'].includes(coreMessageType)) ||
      templateId === 'new'
    )
      return;

    (async () => {
      let _templateData = {};

      if (templateId) _templateData = await request(`/${pluginId}/templates/${templateId}`, { method: 'GET' });
      else if (coreMessageType)
        _templateData = await request(`/${pluginId}/core/${coreMessageType}`, { method: 'GET' });

      if (coreMessageType && isEmpty(_templateData.design)) {
        let _message = _templateData.message;

        if (_templateData.message && _templateData.message.match(/\<body/)) {
          const parser = new DOMParser();
          const parsedDocument = parser.parseFromString(_message, 'text/html');
          _message = parsedDocument.body.innerText;
        }

        _message = striptags(_message, ['a', 'img', 'strong', 'b', 'i', '%', '%='])
          .replace(/"/g, "'")
          .replace(/<%|&#x3C;%/g, '{{')
          .replace(/%>|%&#x3E;/g, '}}')
          .replace(/\n/g, '');

        _templateData.design = JSON.parse(
          JSON.stringify(standardEmailRegistrationTemplate).replace('__PLACEHOLDER__', _message)
        );
      }

      setTemplateData(_templateData);
      setBodyText(_templateData.bodyText);

      const editorConfigApi = (await request(`/${pluginId}/config`, { method: 'GET' })).config.editor;

      if (isMounted.current && editorConfigApi) {
        if (editorConfigApi.tools) {
          setEditorTools((state) => merge(state, editorConfigApi.tools));
        }
        if (editorConfigApi.options) {
          setEditorOptions((state) => merge(state, editorConfigApi.options));
        }
        if (editorConfigApi.appearance) {
          setEditorAppearance((state) => merge(state, editorConfigApi.appearance));
        }
      }

      emailEditorRef.current?.editor?.loadDesign(_templateData.design);
    })();
  }, [configLoaded, templateId, coreMessageType]);

  const saveDesign = () => {
    emailEditorRef.current.editor.exportHtml(async (data) => {
      const { design, html } = data;

      try {
        // strapi.lockAppWithOverlay();
        let response;

        if (templateId) {
          response = await request(`/${pluginId}/templates/${templateId}`, {
            method: 'POST',
            body: {
              name: templateData?.name || formatMessage({ id: getTrad('noName') }),
              subject: templateData?.subject || '',
              design,
              bodyText,
              bodyHtml: html,
            },
          });
        } else if (coreMessageType) {
          response = await request(`/${pluginId}/core/${coreMessageType}`, {
            method: 'POST',
            body: {
              subject: templateData?.subject || '',
              design,
              message: html,
              bodyHtml: html,
              bodyText,
            },
          });
        }

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
      emailEditorRef.current?.editor?.registerCallback('selectImage', onSelectImageHandler);

      if (templateData) emailEditorRef.current.editor.loadDesign(templateData.design);
    }, 500);
  };

  // Custom media uploads
  const [imageUploadDoneCallback, setImageUploadDoneCallback] = useState(undefined);

  const onSelectImageHandler = (data, done) => {
    setImageUploadDoneCallback(() => done);
    setIsMediaLibraryOpen(true);
  };

  const handleMediaLibraryChange = (data) => {
    if (imageUploadDoneCallback) {
      imageUploadDoneCallback({ url: data.url });
      setImageUploadDoneCallback(undefined);
    } else console.log(imageUploadDoneCallback);
  };

  const handleToggleMediaLibrary = () => {
    setIsMediaLibraryOpen((prev) => !prev);
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
              disabled={isCore}
              onChange={({ target: { value } }) => {
                setTemplateData((state) => ({ ...state, name: value }));
              }}
              placeholder={isCore ? getTrad(coreMessageType) : getTrad('designer.templateNameInputFieldPlaceholder')}
              type="text"
              value={templateData?.name || ''}
              style={{ marginTop: 0, width: '40%', marginRight: 10 }}
            />
            <InputText
              // error={formErrors[input.name]}
              name="subject"
              onChange={({ target: { value } }) => {
                setTemplateData((state) => ({ ...state, subject: value }));
              }}
              placeholder={getTrad('designer.templateSubjectInputFieldPlaceholder')}
              type="text"
              value={templateData?.subject || ''}
              style={{ marginTop: 0, width: '60%', marginRight: 10 }}
            />
            <Button onClick={saveDesign} color="success">
              {formatMessage({ id: getTrad('designer.action.saveTemplate') })}
            </Button>
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
          {configLoaded && (
            <div style={{ height: '100%', display: mode === 'html' ? 'flex' : 'none' }}>
              <React.StrictMode>
                <EmailEditor
                  ref={emailEditorRef}
                  onLoad={onLoadHandler}
                  style={{ border: '1px solid #dedede' }}
                  locale={strapi.currentLanguage}
                  appearance={editorAppearance}
                  tools={editorTools}
                  options={editorOptions}
                />
              </React.StrictMode>
            </div>
          )}
          <div style={{ display: mode === 'text' ? 'block' : 'none' }}>
            <Textarea name="textarea" onChange={({ target: { value } }) => setBodyText(value)} value={bodyText} />
          </div>
        </>
      </DesignerContainer>
      <MediaLibrary
        onToggle={handleToggleMediaLibrary}
        isOpen={isMediaLibraryOpen}
        onChange={handleMediaLibraryChange}
        filesToUpload={filesToUpload}
      />
    </>
  );
};

export default memo(EmailDesigner);

EmailDesigner.propTypes = {
  isCore: PropTypes.bool,
};

EmailDesigner.defaultProps = {
  isCore: false,
};
