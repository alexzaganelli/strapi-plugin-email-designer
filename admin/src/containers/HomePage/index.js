import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import {
  PopUpWarning,
  LoadingIndicator,
  request,
  useGlobalContext,
  dateFormats,
  dateToUtcTime,
} from 'strapi-helper-plugin';
import { faLink, faFileExport, faFileImport, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useHistory } from 'react-router-dom';
import { Table, Button } from '@buffetjs/core';
import { Duplicate, Remove } from '@buffetjs/icons';
import { Tooltip } from '@buffetjs/styles';
import { Header } from '@buffetjs/custom';
import { isNil, pick, uniqBy } from 'lodash';
import GitHubButton from 'react-github-btn';

import styled from 'styled-components';
import TabsNav from '../../components/Tabs';
import getTrad from '../../utils/getTrad';
import pluginId from '../../pluginId';

const getUrl = (to) => (to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`);

const Wrapper = styled.div`
  margin-bottom: 30px;
`;

const CustomTable = styled(Table)`
  p {
    margin-bottom: 0;
  }
  tr,
  td {
    height: 54px !important;
  }
`;

const FooterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterButtonsWrapper = styled.div`
  button {
    margin-right: 0.5rem;
    &:last-of-type {
      margin-right: 0;
    }
  }
`;

const FooterGitHubWrapper = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-content: center;
`;

const HomePage = () => {
  const { push } = useHistory();
  const { formatMessage, plugins, currentEnvironment } = useGlobalContext();
  const [templates, setTemplates] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [duplicateConfirmationModal, setDuplicateConfirmationModal] = useState(false);
  const [importConfirmationModal, setImportConfirmationModal] = useState(false);
  const [importedTemplates, setImportedTemplates] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('customEmailTemplates');

  const emailTemplatesFileSelect = useRef();

  useEffect(() => {
    (async () => {
      let templatesData = await request(`/${pluginId}/templates`, {
        method: 'GET',
      });
      templatesData.forEach((data) => {
        data.enabled = data.enabled.toString();
        data.created_at = dateToUtcTime(data.created_at).format(dateFormats.date);
      });
      setTemplates(
        templatesData.map((row) => pick(row, ['id', 'sourceCodeToTemplateId', 'name', 'enabled', 'created_at']))
      );
    })();
  }, []);

  const duplicateTemplateHandler = useCallback(async () => {
    try {
      const response = await request(`/${pluginId}/templates/duplicate/${duplicateConfirmationModal}`, {
        method: 'POST',
      });

      push(getUrl(`design/${response.id}`));
    } catch (error) {
      strapi.notification.toggle({
        type: 'warning',
        message: { id: getTrad('notification.impossibleToDuplicate') },
      });
    }
  }, [duplicateConfirmationModal, push]);

  const deleteTemplateHandler = useCallback(async () => {
    try {
      const { removed } = await request(`/${pluginId}/templates/${deleteConfirmationModal}`, {
        method: 'DELETE',
      });

      if (removed) {
        setTemplates((state) => state.filter((el) => el.id !== deleteConfirmationModal));
        setDeleteConfirmationModal(false);
        strapi.notification.toggle({
          type: 'success',
          message: { id: getTrad('notification.templateDeleted') },
        });
      }
    } catch (error) {
      console.log(error);
      strapi.notification.toggle({
        type: 'warning',
        message: { id: getTrad('notification.impossibileToDeleteTemplate') },
      });
    }
  }, [deleteConfirmationModal]);

  const exportTemplatesHandler = async () => {
    const templates = await request(`/${pluginId}/templates`, {
      method: 'GET',
    });

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(templates))}`;
    let a = document.createElement('a');
    a.href = dataStr;
    a.download = `${pluginId}-templates_${dateToUtcTime().unix()}.json`;
    a.click();
  };

  const fileChangeHandler = (event) => {
    const file = event.target.files[0];

    if (file) {
      const fr = new FileReader();
      fr.onload = async () => {
        const content = JSON.parse(fr.result.toString());
        setImportConfirmationModal(true);
        setImportedTemplates(content);
      };

      fr.readAsText(file);
    }
  };

  const handleTemplatesImport = async () => {
    setImportLoading(true);
    let _importedTemplates = [];

    importedTemplates.forEach(async (template) => {
      const response = await request(`/${pluginId}/templates/${template.id}`, {
        // later templateId
        method: 'POST',
        body: {
          ...template,
          created_at: dateToUtcTime().unix(),
          updated_at: dateToUtcTime().unix(),
          import: true,
        },
      });

      _importedTemplates.push(response);
    });

    let newTemplates = [...templates, ..._importedTemplates].map((data) => {
      data.enabled = data.enabled.toString();
      data.created_at = dateToUtcTime(
        data.created_at,
        dateToUtcTime(data.created_at).isValid() ? undefined : dateFormats.date
      ).format('dddd, MMMM Do YYYY');

      return data;
    });

    newTemplates = uniqBy(newTemplates, function (e) {
      return e.id;
    });

    setTemplates(newTemplates);

    emailTemplatesFileSelect.current.value = '';
    setImportedTemplates(undefined);
    setImportConfirmationModal(undefined);
    setImportLoading(false);
    window.location.reload(false);
  };

  const headers = [
    { name: formatMessage({ id: getTrad('table.name') }), value: 'name' },
    { name: formatMessage({ id: getTrad('table.templateId') }), value: 'id' },
    { name: formatMessage({ id: getTrad('table.sourceCodeToTemplateId') }), value: 'sourceCodeToTemplateId' },
    { name: formatMessage({ id: getTrad('table.enabled') }), value: 'enabled' },
    { name: formatMessage({ id: getTrad('table.createdAt') }), value: 'created_at' },
  ];

  const headersCore = [{ name: formatMessage({ id: getTrad('table.coreMessageType') }), value: 'name' }];
  const coreMessages = [
    {
      coreMessageType: 'user-address-confirmation',
      name: formatMessage({ id: getTrad('user-address-confirmation') }),
    },
    {
      coreMessageType: 'reset-password',
      name: formatMessage({ id: getTrad('reset-password') }),
    },
  ];

  return (
    <div className="container-fluid" style={{ padding: '18px 30px 66px 30px' }}>
      <PopUpWarning
        isConfirmButtonLoading={importLoading}
        isOpen={importConfirmationModal && importedTemplates.length > 0}
        content={{
          title: getTrad('pleaseConfirm'),
          message: getTrad('notification.importTemplate'),
        }}
        popUpWarningType="danger"
        toggleModal={() => {
          emailTemplatesFileSelect.current.value = '';
          setImportedTemplates(undefined);
          setImportConfirmationModal(undefined);
        }}
        onConfirm={async () => {
          await handleTemplatesImport();
        }}
      />
      <PopUpWarning
        isOpen={!isNil(duplicateConfirmationModal) && duplicateConfirmationModal !== false}
        content={{
          title: getTrad('pleaseConfirm'),
          message: getTrad('questions.sureToDuplicate'),
        }}
        popUpWarningType="danger"
        toggleModal={() => setDuplicateConfirmationModal(false)}
        onConfirm={async () => {
          await duplicateTemplateHandler();
        }}
      />
      <PopUpWarning
        isOpen={!isNil(deleteConfirmationModal) && deleteConfirmationModal !== false}
        content={{
          title: getTrad('pleaseConfirm'),
          message: getTrad('questions.sureToDelete'),
        }}
        popUpWarningType="danger"
        toggleModal={() => setDeleteConfirmationModal(false)}
        onConfirm={async () => {
          await deleteTemplateHandler();
        }}
      />
      <Header
        isLoading={!plugins[pluginId].isReady}
        actions={[
          ...(activeTab === 'customEmailTemplates'
            ? [
                {
                  label: formatMessage({ id: getTrad('newTemplate') }),
                  onClick: () => push(getUrl(`design/new`)),
                  color: 'primary',
                  type: 'button',
                  icon: true,
                },
              ]
            : []),
        ]}
        title={{
          label: formatMessage({ id: getTrad('plugin.name') }),
        }}
        content={formatMessage({ id: getTrad('header.description') })}
      />

      {!plugins[pluginId].isReady && <LoadingIndicator />}

      <TabsNav
        style={{ display: 'flex-inline', marginTop: '0.4rem', marginBottom: '2rem' }}
        links={[
          {
            isActive: activeTab === 'customEmailTemplates',
            name: getTrad('customEmailTemplates'),
            onClick: () => setActiveTab('customEmailTemplates'),
          },
          {
            isActive: activeTab === 'coreEmailTemplates',
            name: getTrad('coreEmailTemplates'),
            onClick: () => setActiveTab('coreEmailTemplates'),
          },
        ]}
      />

      <Wrapper style={{ display: activeTab === 'coreEmailTemplates' ? 'block' : 'none' }}>
        <CustomTable
          className="remove-margin"
          headers={headersCore}
          rows={coreMessages}
          onClickRow={(e, data) => {
            push(getUrl(`core/${data.coreMessageType}`));
          }}
          rowLinks={[
            {
              icon: (
                <>
                  <div data-for="edit" data-tip={formatMessage({ id: getTrad('tooltip.edit') })}>
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </div>
                  <Tooltip id="edit" />
                </>
              ),
              onClick: (data) => {
                push(getUrl(`core/${data.coreMessageType}`));
              },
            },
          ]}
        />
      </Wrapper>

      <Wrapper style={{ display: activeTab === 'customEmailTemplates' ? 'block' : 'none' }}>
        <CustomTable
          className="remove-margin"
          headers={headers}
          rows={templates}
          // customRow={this.CustomRow}
          onClickRow={(e, data) => {
            push(getUrl(`design/${data.id}`));
          }}
          rowLinks={[
            {
              icon: (
                <>
                  <div data-for="duplicate" data-tip={formatMessage({ id: getTrad('tooltip.duplicate') })}>
                    <Duplicate fill="#000000" />
                  </div>
                  <Tooltip id="duplicate" />
                </>
              ),
              onClick: (data) => setDuplicateConfirmationModal(data.id),
            },
            {
              icon: (
                <>
                  <div data-for="edit" data-tip={formatMessage({ id: getTrad('tooltip.edit') })}>
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </div>
                  <Tooltip id="edit" />
                </>
              ),
              onClick: (data) => {
                push(getUrl(`design/${data.id}`));
              },
            },
            {
              icon: (
                <>
                  <div data-for="copy_template_id" data-tip={formatMessage({ id: getTrad('tooltip.copyTemplateId') })}>
                    <FontAwesomeIcon icon={faLink} />
                  </div>
                  <Tooltip id="copy_template_id" />
                </>
              ),
              onClick: (data) => {
                navigator.clipboard.writeText(`${data.id}`).then(
                  function () {
                    strapi.notification.toggle({
                      type: 'success',
                      message: {
                        id: getTrad('notification.templateIdCopied'),
                      },
                    });
                    console.log('Template ID copied to clipboard successfully!');
                  },
                  function (err) {
                    console.error('Could not copy text: ', err);
                  }
                );
              },
            },
            {
              icon: (
                <>
                  <div data-for="delete_template" data-tip={formatMessage({ id: getTrad('tooltip.delete') })}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </div>
                  <Tooltip id="delete_template" />
                </>
              ),
              onClick: (data) => setDeleteConfirmationModal(data.id),
            },
          ]}
        />
      </Wrapper>

      <FooterWrapper>
        <Link to={`/plugins/${pluginId}/how-to`}>{formatMessage({ id: getTrad('howToUse.link') })}</Link>

        {activeTab === 'customEmailTemplates' && (
          <FooterButtonsWrapper>
            <Button
              onClick={() => exportTemplatesHandler()}
              color="success"
              icon={<FontAwesomeIcon icon={faFileExport} />}
            >
              {formatMessage({ id: getTrad('designer.exportTemplates') })}
            </Button>

            <Button
              onClick={() => {
                emailTemplatesFileSelect.current.click();
              }}
              color="delete"
              icon={<FontAwesomeIcon icon={faFileImport} />}
            >
              {formatMessage({ id: getTrad('designer.importTemplates') })}
            </Button>
            <span style={{ display: 'none' }}>
              <input type="file" ref={emailTemplatesFileSelect} onChange={fileChangeHandler} />
            </span>
          </FooterButtonsWrapper>
        )}
      </FooterWrapper>

      <FooterGitHubWrapper>
        {currentEnvironment !== 'production' && (
          <GitHubButton
            href="https://github.com/alexzaganelli/strapi-plugin-email-designer"
            data-show-count="true"
            aria-label="Star alexzaganelli/strapi-plugin-email-designer on GitHub"
          >
            Star
          </GitHubButton>
        )}
        <>
          <div
            data-for="block"
            data-tip="This is visible only on development env"
            style={{
              marginLeft: '8px',
            }}
          >
            <Remove />
          </div>
          <Tooltip id="block" />
        </>
      </FooterGitHubWrapper>
    </div>
  );
};

export default memo(HomePage);
