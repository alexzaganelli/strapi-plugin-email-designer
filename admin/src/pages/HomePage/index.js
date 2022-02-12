import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { request, useNotification, LoadingIndicatorPage } from '@strapi/helper-plugin';
import { faCopy as CopyIcon, faInfoCircle, faFileExport, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { Eye, EyeStriked, Pencil, Duplicate, ExclamationMarkCircle, Trash, Plus, ArrowLeft } from '@strapi/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router-dom';
import { Link } from '@strapi/design-system/Link';
import { Button } from '@strapi/design-system/Button';
import { Tooltip } from '@strapi/design-system/Tooltip';
import { Table, Thead, Tbody, TFooter, Tr, Th, Td } from '@strapi/design-system/Table';
import { Box } from '@strapi/design-system/Box';
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog';
import { IconButton } from '@strapi/design-system/IconButton';
import { Stack } from '@strapi/design-system/Stack';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { Tabs, Tab, TabGroup, TabPanels, TabPanel } from '@strapi/design-system/Tabs';
import { Layout, BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
import { isEmpty, isNil, pick, uniqBy } from 'lodash';
import GitHubButton from 'react-github-btn';

import styled from 'styled-components';
import getMessage from '../../utils/getMessage';
import pluginId from '../../pluginId';
import dayjs from 'dayjs';

const getUrl = (to) => (to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`);

const FooterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0 10px;
`;

const FooterButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  button {
    margin-right: 0.5rem;
    &:last-of-type {
      margin-right: 0;
    }
  }
`;

const HomePage = () => {
  const { push, goBack } = useHistory();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [duplicateConfirmationModal, setDuplicateConfirmationModal] = useState(false);
  const [importConfirmationModal, setImportConfirmationModal] = useState(false);
  const [importedTemplates, setImportedTemplates] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('customEmailTemplates');
  const toggleNotification = useNotification(); // FIXME: useNotification cause re-rendering

  const emailTemplatesFileSelect = useRef(null);

  // TODO: handle current locale
  const dateFormat = 'DD/MM/YYYY HH:mm';

  useEffect(() => {
    (async () => {
      let templatesData = await request(`/${pluginId}/templates`, {
        method: 'GET',
      });
      templatesData.forEach((template) => {
        template.createdAt = dayjs(template.createdAt).format(dateFormat);
      });

      setEmailTemplates(
        templatesData.map((row) => pick(row, ['id', 'templateReferenceId', 'name', 'enabled', 'createdAt']))
      );
    })();
  }, []);

  const handleTemplateDuplication = useCallback(async () => {
    try {
      const response = await request(`/${pluginId}/templates/duplicate/${duplicateConfirmationModal}`, {
        method: 'POST',
      });

      push(getUrl(`design/${response.id}`));
    } catch (error) {
      toggleNotification({
        type: 'warning',
        message: `${pluginId}.notification.impossibleToDuplicate`,
      });
    }
  }, [duplicateConfirmationModal, push]);

  const handleTemplateDeletion = useCallback(async () => {
    try {
      const { removed } = await request(`/${pluginId}/templates/${deleteConfirmationModal}`, {
        method: 'DELETE',
      });

      if (removed) {
        setEmailTemplates((state) => state.filter((el) => el.id !== deleteConfirmationModal));
        setDeleteConfirmationModal(false);
        toggleNotification({
          type: 'success',
          message: `${pluginId}.notification.templateDeleted`,
        });
      }
    } catch (error) {
      console.log(error);
      toggleNotification({
        type: 'warning',
        message: `${pluginId}.notification.impossibileToDeleteTemplate`,
      });
    }
  }, [deleteConfirmationModal]);

  const handleTemplatesExport = async () => {
    const templates = await request(`/${pluginId}/templates`, {
      method: 'GET',
    });

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(templates))}`;
    let a = document.createElement('a');
    a.href = dataStr;
    a.download = `${pluginId}-templates_${dayjs().unix()}.json`;
    a.click();
  };

  const handleFileChange = (event) => {
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
    try {
      setImportLoading(true);
      let _importedTemplates = [];

      for await (const template of importedTemplates) {
        console.log('💬 :: forawait :: template', template);
        const response = await request(`/${pluginId}/templates/${template.id}`, {
          method: 'POST',
          body: {
            ...template,
            created_at: dayjs().unix(),
            updated_at: dayjs().unix(),
            import: true,
          },
        });
        console.log('💬 :: forawait :: response', response);

        if (!isEmpty(response)) _importedTemplates.push(response);
      }

      let newTemplates = [...emailTemplates, ..._importedTemplates].map((data) => {
        data.enabled = data.enabled?.toString();
        data.createdAt = dayjs(data.createdAt).format(dateFormat);

        return data;
      });

      newTemplates = uniqBy(newTemplates, (_) => _.id);

      setEmailTemplates(newTemplates);

      emailTemplatesFileSelect.current.value = '';
      setImportConfirmationModal(false);
      setImportLoading(false);
      setImportedTemplates(undefined);
    } catch (error) {
      setImportConfirmationModal(false);
      setImportLoading(false);
      setImportedTemplates(undefined);
      console.error('💬 :: handleTemplatesImport :: Error', error);
    }
  };

  const emailTemplatesHeaders = [
    { name: getMessage('table.name'), value: 'name' },
    // { name: getMessage('table.templateId'), value: 'id' },
    { name: getMessage('table.templateReferenceId'), value: 'templateReferenceId' },
    { name: getMessage('table.enabled'), value: 'enabled' },
    { name: getMessage('table.createdAt'), value: 'createdAt' },
  ];

  const coreTemplatesHeaders = [{ name: getMessage('table.coreEmailType'), value: 'name' }];
  const coreEmailTypes = [
    {
      coreEmailType: 'user-address-confirmation',
      name: getMessage('user-address-confirmation'),
    },
    {
      coreEmailType: 'reset-password',
      name: getMessage('reset-password'),
    },
  ];

  return (
    <Layout>
      {emailTemplates === undefined ? (
        <LoadingIndicatorPage />
      ) : (
        <>
          <Dialog
            // isConfirmButtonLoading={importLoading}
            isOpen={importConfirmationModal && importedTemplates.length > 0}
            title={getMessage('pleaseConfirm')}
            onClose={() => {
              emailTemplatesFileSelect.current.value = '';
              setImportedTemplates(undefined);
              setImportConfirmationModal(false);
            }}
          >
            <DialogBody icon={<ExclamationMarkCircle />}>
              <Stack size={2}>
                <Flex justifyContent="center">
                  <Typography id="confirm-description">{getMessage('notification.importTemplate')}</Typography>
                </Flex>
              </Stack>
            </DialogBody>
            <DialogFooter
              startAction={
                <Button onClick={() => setImportConfirmationModal(false)} variant="tertiary">
                  Cancel
                </Button>
              }
              endAction={
                <Button variant="danger-light" startIcon={<Trash />} onClick={() => handleTemplatesImport()}>
                  Confirm
                </Button>
              }
            />
          </Dialog>
          <Dialog
            isOpen={!isNil(duplicateConfirmationModal) && duplicateConfirmationModal !== false}
            title={getMessage('pleaseConfirm')}
            onClose={() => setDuplicateConfirmationModal(false)}
          >
            <DialogBody icon={<ExclamationMarkCircle />}>
              <Stack size={2}>
                <Flex justifyContent="center">
                  <Typography id="confirm-description">{getMessage('questions.sureToDuplicate')}</Typography>
                </Flex>
              </Stack>
            </DialogBody>
            <DialogFooter
              startAction={
                <Button onClick={() => setDuplicateConfirmationModal(false)} variant="tertiary">
                  Cancel
                </Button>
              }
              endAction={
                <Button variant="danger-light" startIcon={<Duplicate />} onClick={() => handleTemplateDuplication()}>
                  Confirm
                </Button>
              }
            />
          </Dialog>

          <Dialog
            isOpen={!isNil(deleteConfirmationModal) && deleteConfirmationModal !== false}
            title={getMessage('pleaseConfirm')}
            toggleModal={() => setDeleteConfirmationModal(false)}
            onClose={() => setDeleteConfirmationModal(false)}
          >
            <DialogBody icon={<ExclamationMarkCircle />}>
              <Stack size={2}>
                <Flex justifyContent="center">
                  <Typography id="confirm-description">{getMessage('questions.sureToDelete')}</Typography>
                </Flex>
              </Stack>
            </DialogBody>
            <DialogFooter
              startAction={
                <Button onClick={() => setDeleteConfirmationModal(false)} variant="tertiary">
                  Cancel
                </Button>
              }
              endAction={
                <Button variant="danger-light" startIcon={<Trash />} onClick={() => handleTemplateDeletion()}>
                  Confirm
                </Button>
              }
            />
          </Dialog>

          <BaseHeaderLayout
            navigationAction={
              <Link startIcon={<ArrowLeft />} to="#" onClick={goBack}>
                {getMessage('goBack')}
              </Link>
            }
            primaryAction={
              <Button startIcon={<Plus />} onClick={() => push(getUrl('design/new'))}>
                {getMessage('newTemplate')}
              </Button>
            }
            title={getMessage('plugin.name')}
            subtitle={getMessage('header.description')}
            as="h2"
          />

          <ContentLayout>
            <TabGroup
              label="Templates list"
              id="tabs"
              onTabChange={(selected) => setActiveTab(selected === 0 ? 'customEmailTemplates' : 'coreEmailTemplates')}
            >
              <Tabs>
                <Tab>{getMessage('customEmailTemplates')}</Tab>
                <Tab>{getMessage('coreEmailTemplates')}</Tab>
              </Tabs>

              <TabPanels>
                <TabPanel>
                  <Table
                    colCount={emailTemplatesHeaders.length}
                    rowCount={emailTemplates.length}
                    footer={
                      <TFooter icon={<Plus />} onClick={() => push(getUrl('design/new'))}>
                        Add another field to this collection type
                      </TFooter>
                    }
                  >
                    <Thead>
                      <Tr>
                        {emailTemplatesHeaders.map((header) => (
                          <Th key={header.value}>
                            <Typography variant="sigma">{header.name}</Typography>
                          </Th>
                        ))}
                        <Th>
                          <Typography variant="sigma">{getMessage('table.actions')}</Typography>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {emailTemplates.map((template, index) => (
                        <Tr key={index}>
                          <Td>
                            <Typography textColor="neutral800">{template.name}</Typography>
                          </Td>
                          {/* <Td>
                            <Typography textColor="neutral800">{template.id}</Typography>
                          </Td> */}
                          <Td>
                            <Typography textColor="neutral800">{template.templateReferenceId}</Typography>
                          </Td>
                          <Td>
                            <Typography textColor="neutral800">
                              {template.enabled === true ? <Eye fill="#dedede" /> : <EyeStriked fillColor="#dedede" />}
                            </Typography>
                          </Td>
                          <Td>
                            <Typography textColor="neutral800">{template.createdAt}</Typography>
                          </Td>
                          <Td>
                            <Flex>
                              <IconButton
                                label={getMessage('tooltip.edit')}
                                icon={<Pencil />}
                                onClick={() => push(getUrl(`design/${template.id}`))}
                                noBorder
                              />

                              <IconButton
                                label={getMessage('tooltip.duplicate')}
                                icon={<Duplicate fill="#000000" />}
                                onClick={() => setDuplicateConfirmationModal(template.id)}
                                noBorder
                              />

                              <IconButton
                                label={getMessage('tooltip.copyTemplateId')}
                                // FIXME: use Strapi's icon
                                icon={<FontAwesomeIcon icon={CopyIcon} />}
                                onClick={() => {
                                  navigator.clipboard.writeText(`${template.id}`).then(
                                    () => {
                                      toggleNotification({
                                        type: 'success',
                                        message: {
                                          id: `${pluginId}.notification.templateIdCopied`,
                                        },
                                      });
                                      console.log('Template ID copied to clipboard successfully!');
                                    },
                                    (err) => {
                                      console.error('Could not copy text: ', err);
                                    }
                                  );
                                }}
                                noBorder
                              />

                              <Box paddingLeft={1}>
                                <IconButton
                                  label={getMessage('tooltip.delete')}
                                  icon={<Trash />}
                                  onClick={() => setDeleteConfirmationModal(template.id)}
                                  noBorder
                                />
                              </Box>
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TabPanel>

                <TabPanel>
                  <Box background="neutral100">
                    <Table colCount={coreTemplatesHeaders.length} rowCount={10} rows={coreEmailTypes}>
                      <Thead>
                        <Tr>
                          {coreTemplatesHeaders.map((header) => (
                            <Th key={header.name}>
                              <Typography variant="sigma">{header.value}</Typography>
                            </Th>
                          ))}
                          <Th>
                            <Typography variant="sigma">{getMessage('table.actions')}</Typography>
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {coreEmailTypes.map((coreEmailType, index) => (
                          <Tr key={index}>
                            <Td>
                              <Typography textColor="neutral800">{coreEmailType.name}</Typography>
                            </Td>
                            <Td>
                              <Flex>
                                <IconButton
                                  label={getMessage('tooltip.edit')}
                                  icon={<Pencil />}
                                  onClick={() => push(getUrl(`core/${coreEmailType.coreEmailType}`))}
                                  noBorder
                                />
                              </Flex>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
              </TabPanels>
            </TabGroup>

            <FooterWrapper>
              <Link to={`/plugins/${pluginId}/how-to`}>{getMessage('howToUse.link')}</Link>

              {true && ( // TODO: get currentEnvironment
                <Flex>
                  <GitHubButton
                    href="https://github.com/alexzaganelli/strapi-plugin-email-designer"
                    data-show-count="true"
                    aria-label="Star alexzaganelli/strapi-plugin-email-designer on GitHub"
                  >
                    Star
                  </GitHubButton>

                  <Tooltip description="This is visible only on development env">
                    <FontAwesomeIcon icon={faInfoCircle} style={{ marginLeft: 6, marginTop: 0 }} />
                  </Tooltip>
                </Flex>
              )}

              {activeTab === 'customEmailTemplates' && (
                <FooterButtonsWrapper>
                  {emailTemplates?.length > 0 && (
                    <Button
                      onClick={() => handleTemplatesExport()}
                      color="success"
                      icon={<FontAwesomeIcon icon={faFileExport} />}
                    >
                      {getMessage('designer.exportTemplates')}
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      emailTemplatesFileSelect?.current?.click();
                    }}
                    color="delete"
                    icon={<FontAwesomeIcon icon={faFileImport} />}
                  >
                    {getMessage('designer.importTemplates')}
                  </Button>
                  <span style={{ display: 'none' }}>
                    <input type="file" ref={emailTemplatesFileSelect} onChange={handleFileChange} />
                  </span>
                </FooterButtonsWrapper>
              )}
            </FooterWrapper>
            {/* <FooterGitHubWrapper>
            </FooterGitHubWrapper> */}
          </ContentLayout>
        </>
      )}
    </Layout>
  );
};

export default memo(HomePage);
