import React, { useCallback, useState, useEffect, memo, useRef } from 'react';
import { request, auth, useNotification, LoadingIndicatorPage } from '@strapi/helper-plugin';
import { Box } from '@strapi/design-system/Box';
import { Textarea } from '@strapi/design-system/Textarea';
import { Tabs, Tab, TabGroup } from '@strapi/design-system/Tabs';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';
import { Link } from '@strapi/design-system/Link';
import { isEmpty, isFinite, merge } from 'lodash';
import { ArrowLeft } from '@strapi/icons';
import { standardEmailRegistrationTemplate } from '../../helpers/coreTemplateHelper';

import PropTypes from 'prop-types';
import striptags from 'striptags';
import EmailEditor from 'react-email-editor';
import styled from 'styled-components';

import pluginId from '../../pluginId';
import getMessage from '../../utils/getMessage';
// import MediaLibrary from '../../components/MediaLibrary';
const __DEV__ = process.env.NODE_ENV !== 'production';

const DesignerContainer = styled.div`
  padding: 18px 30px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Bar = styled.div`
  flex: 1;
  color: #000;
  margin: 6px 0 10px 0;
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
const currentLanguage = strapi.currentLanguage;

const defaultEditorTools = {
  image: {
    properties: {
      src: {
        value: {
          url: 'https://picsum.photos/600/350',
        },
      },
    },
  },
};

const defaultEditorAppearance = { minWidth: '100%', theme: 'light' };
const defaultEditorOptions = {
  fonts: {
    showDefaultFonts: false,
    customFonts: [
      {
        label: 'Andale Mono',
        value: 'andale mono,times',
      },
      {
        label: 'Arial',
        value: 'arial,helvetica,sans-serif',
      },
      {
        label: 'Arial Black',
        value: 'arial black,avant garde,arial',
      },
      {
        label: 'Book Antiqua',
        value: 'book antiqua,palatino',
      },
      {
        label: 'Comic Sans MS',
        value: 'comic sans ms,sans-serif',
      },
      {
        label: 'Courier New',
        value: 'courier new,courier',
      },
      { label: 'Georgia', value: 'georgia,palatino' },
      {
        label: 'Helvetica',
        value: 'helvetica,sans-serif',
      },
      { label: 'Impact', value: 'impact,chicago' },
      { label: 'Symbol', value: 'symbol' },
      {
        label: 'Tahoma',
        value: 'tahoma,arial,helvetica,sans-serif',
      },
      { label: 'Terminal', value: 'terminal,monaco' },
      {
        label: 'Times New Roman',
        value: 'times new roman,times',
      },
      {
        label: 'Trebuchet MS',
        value: 'trebuchet ms,geneva',
      },
      { label: 'Verdana', value: 'verdana,geneva' },
      {
        label: 'Lobster Two',
        value: "'Lobster Two',cursive",
        url: 'https://fonts.googleapis.com/css?family=Lobster+Two:400,700&display=swap',
      },
      {
        label: 'Playfair Display',
        value: "'Playfair Display',serif",
        url: 'https://fonts.googleapis.com/css?family=Playfair+Display:400,700&display=swap',
      },
      {
        label: 'Rubik',
        value: "'Rubik',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap',
      },
      {
        label: 'Source Sans Pro',
        value: "'Source Sans Pro',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700&display=swap',
      },
      {
        label: 'Open Sans',
        value: "'Open Sans',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap',
      },
      {
        label: 'Crimson Text',
        value: "'Crimson Text',serif",
        url: 'https://fonts.googleapis.com/css?family=Crimson+Text:400,700&display=swap',
      },
      {
        label: 'Montserrat',
        value: "'Montserrat',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap',
      },
      {
        label: 'Old Standard TT',
        value: "'Old Standard TT',serif",
        url: 'https://fonts.googleapis.com/css?family=Old+Standard+TT:400,700&display=swap',
      },
      {
        label: 'Lato',
        value: "'Lato',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Lato:400,700&display=swap',
      },
      {
        label: 'Raleway',
        value: "'Raleway',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap',
      },
      {
        label: 'Cabin',
        value: "'Cabin',sans-serif",
        url: 'https://fonts.googleapis.com/css?family=Cabin:400,700&display=swap',
      },
      {
        label: 'Pacifico',
        value: "'Pacifico',cursive",
        url: 'https://fonts.googleapis.com/css?family=Pacifico&display=swap',
      },
    ],
  },
};
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

const EmailDesignerPage = ({ isCore = false }) => {
  const emailEditorRef = useRef();
  const history = useHistory();

  const { templateId, coreEmailType } = useParams();
  const [templateData, setTemplateData] = useState();
  const [referenceIdEmpty, setReferenceIdEmpty] = useState('');
  const [enablePrompt, togglePrompt] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [mode, setMode] = useState('html');
  const [serverConfigLoaded, setServerConfigLoaded] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [editorAppearance, setEditorAppearance] = useState({ ...defaultEditorAppearance });
  const [editorTools, setEditorTools] = useState({ ...defaultEditorTools });
  const [editorOptions, setEditorOptions] = useState({ ...defaultEditorOptions, ...currentTemplateTags });
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [filesToUpload /* , setFilesToUpload */] = useState({});
  const toggleNotification = useNotification();

  const saveDesign = async () => {
    if (!coreEmailType && !templateData?.templateReferenceId) {
      /*
      FIXME: useNotification cause re-rendering so I temporarly commented all toggleNotification blocks
      toggleNotification({
        type: 'warning',
        message: `${pluginId}.notification.templateReferenceIdNotEmpty`,
      }); */

      setReferenceIdEmpty(' '); // trigger error on TextInput field
      return;
    }
    setReferenceIdEmpty('');

    let design, html;

    try {
      await new Promise((resolve) => {
        emailEditorRef.current.editor.exportHtml((data) => {
          ({ design, html } = data);
          resolve();
        });
      });
    } catch (error) {
      console.log(error);
      return;
    }

    try {
      if (templateId) {
        await request(`/${pluginId}/templates/${templateId}`, {
          method: 'POST',
          body: {
            name: templateData?.name || getMessage('noName'),
            templateReferenceId: templateData?.templateReferenceId,
            subject: templateData?.subject || '',
            design,
            bodyText,
            bodyHtml: html,
          },
        });
      } else if (coreEmailType) {
        await request(`/${pluginId}/core/${coreEmailType}`, {
          method: 'POST',
          body: {
            subject: templateData?.subject || '',
            design,
            message: html,
            bodyText,
          },
        });
      }

      /*
      FIXME: useNotification cause re-rendering so I temporarly commented all toggleNotification blocks
      toggleNotification({
        type: 'success',
        message: `${pluginId}.notification.success.submit`,
      });
      */

      togglePrompt(false);

      /*
      TODO: restore this once useNotification is fixed
      if (templateId === 'new' && templateId !== response.id)
        history.replace(`/plugins/${pluginId}/design/${response.id}`);
        */
      history.push(`/plugins/${pluginId}/`);
    } catch (err) {
      console.error(err);

      const errorMessage = err?.response?.payload?.message;
      if (errorMessage) {
        toggleNotification({
          type: 'warning',
          title: 'Error',
          message: errorMessage,
        });
      } else {
        toggleNotification({
          type: 'warning',
          title: 'Error',
          message: `${pluginId}.notification.error`,
        });
      }
    }
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

  const onLoadHandler = useCallback(() => {
    // ⬇︎ workaround to avoid firing onLoad api before setting the editor ref
    setTimeout(() => {
      emailEditorRef.current?.editor?.addEventListener('onDesignLoad', onDesignLoad);
      emailEditorRef.current?.editor?.registerCallback('selectImage', onSelectImageHandler);

      if (templateData) emailEditorRef.current.editor.loadDesign(templateData.design);
    }, 500);
  }, []);

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

  /* useEffects */
  useEffect(() => {
    // load the editor config
    (async () => {
      const editorConfigApi = await request(`/${pluginId}/config/editor`, { method: 'GET' });

      if (editorConfigApi) {
        if (editorConfigApi.projectId) {
          setProjectId(editorConfigApi.projectId);
        }
        if (editorConfigApi.tools) {
          setEditorTools((state) => merge({}, state, editorConfigApi.tools));
        }
        if (editorConfigApi.options) {
          setEditorOptions((state) => merge({}, state, editorConfigApi.options));
        }
        if (editorConfigApi.appearance) {
          setEditorAppearance((state) => merge({}, state, editorConfigApi.appearance));
        }
        setServerConfigLoaded(true);
      }
    })();

    return () => {
      emailEditorRef.current = false; // release react-email-editor on unmount
    };
  }, []);

  useEffect(() => {
    if (
      (!templateId && !coreEmailType) ||
      (coreEmailType && !['user-address-confirmation', 'reset-password'].includes(coreEmailType)) ||
      templateId === 'new'
    )
      return;

    (async () => {
      let _templateData = {};

      if (templateId) _templateData = await request(`/${pluginId}/templates/${templateId}`, { method: 'GET' });
      else if (coreEmailType) _templateData = await request(`/${pluginId}/core/${coreEmailType}`, { method: 'GET' });

      if (coreEmailType && isEmpty(_templateData.design)) {
        let _message = _templateData.message;

        // eslint-disable-next-line no-useless-escape
        if (_templateData.message && _templateData.message.match(/\<body/)) {
          const parser = new DOMParser();
          const parsedDocument = parser.parseFromString(_message, 'text/html');
          _message = parsedDocument.body.innerText;
        }

        _message = striptags(_message, ['a', 'img', 'strong', 'b', 'i', '%', '%='])
          // eslint-disable-next-line quotes
          .replace(/"/g, "'")
          .replace(/<%|&#x3C;%/g, '{{')
          .replace(/%>|%&#x3E;/g, '}}')
          .replace(/\n/g, '<br />');

        _templateData.design = JSON.parse(
          JSON.stringify(standardEmailRegistrationTemplate).replace('__PLACEHOLDER__', _message)
        );
      }

      setTemplateData(_templateData);
      setBodyText(_templateData.bodyText);
    })();
  }, [templateId, coreEmailType]);

  useEffect(() => {
    setTimeout(() => {
      if (emailEditorRef.current?.editor && templateData?.design) {
        emailEditorRef.current.editor.loadDesign(templateData.design);
      }
    }, 600);
  }, [templateData]);

  return !templateData && !templateId === 'new' ? (
    <LoadingIndicatorPage />
  ) : (
    <>
      <DesignerContainer>
        <Link startIcon={<ArrowLeft />} to="#" onClick={history.goBack} style={{ width: '100px' }}>
          {getMessage('goBack')}
        </Link>
        <Prompt message={getMessage('prompt.unsaved')} when={enablePrompt} />
        <>
          <Bar>
            {!isCore && (
              <Box padding={0} style={{ width: 260, paddingRight: 10 }}>
                <TextInput
                  required
                  name="templateReferenceId"
                  disabled={isCore}
                  onChange={(e) =>
                    setTemplateData((state) => ({
                      ...(state ?? {}),
                      templateReferenceId:
                        e.target.value === ''
                          ? ''
                          : isFinite(parseInt(e.target.value))
                          ? parseInt(e.target.value)
                          : state?.templateReferenceId ?? '',
                    }))
                  }
                  value={templateData?.templateReferenceId ?? ''}
                  label={
                    isCore ? getMessage(coreEmailType) : getMessage('designer.templateReferenceIdInputFieldPlaceholder')
                  }
                  error={referenceIdEmpty}
                />
              </Box>
            )}
            <Box padding={0} style={{ width: isCore ? 450 : '100%', paddingRight: 10 }}>
              <TextInput
                style={{
                  width: '100%',
                }}
                name="name"
                disabled={isCore}
                onChange={(e) => {
                  setTemplateData((state) => ({ ...state, name: e.target.value }));
                }}
                label={
                  isCore ? getMessage('coreEmailTypeLabel') : getMessage('designer.templateNameInputFieldPlaceholder')
                }
                value={isCore ? getMessage(coreEmailType) : templateData?.name || ''}
              />
            </Box>
            <Box padding={0} style={{ width: '100%', paddingRight: 10 }}>
              <TextInput
                style={{
                  width: '100%',
                }}
                name="subject"
                onChange={(value) => {
                  setTemplateData((state) => ({ ...state, subject: value.target.value }));
                }}
                label={getMessage('designer.templateSubjectInputFieldPlaceholder')}
                value={templateData?.subject || ''}
              />
            </Box>
            <Button onClick={saveDesign} color="success">
              {getMessage('designer.action.saveTemplate')}
            </Button>
          </Bar>

          <TabGroup
            label=""
            id="tabs"
            onTabChange={(selected) => setMode(selected === 0 ? 'html' : 'text')}
            style={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Tabs>
              <Tab key={'al3x'}>{getMessage('designer.version.html')}</Tab>
              <Tab>{getMessage('designer.version.text')}</Tab>
            </Tabs>

            <>
              <Box
                style={{
                  flexGrow: 1,
                  minHeight: '540px',
                  backgroundColor: 'white',
                  display: mode === 'html' ? 'flex' : 'none',
                  border: '1px solid #dedede',
                }}
              >
                {serverConfigLoaded && (
                  <React.StrictMode>
                    <EmailEditor
                      ref={emailEditorRef}
                      onLoad={onLoadHandler}
                      locale={strapi.currentLanguage}
                      appearance={editorAppearance}
                      tools={editorTools}
                      options={editorOptions}
                      projectId={projectId}
                    />
                  </React.StrictMode>
                )}
              </Box>

              <Box style={{ display: mode === 'text' ? 'flex' : 'none' }}>
                <Textarea
                  name="textarea"
                  onChange={(e) => setBodyText(e.target.value)}
                  value={bodyText}
                  style={{ minHeight: 450 /* FIXME: use a better way to set the dimensions */ }}
                />
              </Box>
            </>
          </TabGroup>
        </>
      </DesignerContainer>
      {/* <MediaLibrary
        onToggle={handleToggleMediaLibrary}
        isOpen={isMediaLibraryOpen}
        onChange={handleMediaLibraryChange}
        filesToUpload={filesToUpload}
      /> */}
    </>
  );
};

export default memo(EmailDesignerPage, shallowIsEqual);

EmailDesignerPage.propTypes = {
  isCore: PropTypes.bool,
};

EmailDesignerPage.defaultProps = {
  isCore: false,
};

function shallowIsEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    if (__DEV__) console.log('shallowIsEqual: keys1.length !== keys2.length');
    return false;
  }
  for (const key of keys1) {
    if (object1[key] !== object2[key]) {
      if (__DEV__) console.log(`shallowIsEqual: ${key}`, object1[key], ' !== ', object2[key]);
      return false;
    }
  }

  return true;
}
