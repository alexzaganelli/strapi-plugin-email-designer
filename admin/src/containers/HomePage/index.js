/*
 *
 * HomePage
 *
 * Reference: https://strapi.io/documentation/developer-docs/latest/plugin-development/frontend-development.html#environment-setup
 */

import React, {memo, useState, useEffect, useCallback} from 'react';
// import PropTypes from 'prop-types';
import {PopUpWarning, LoadingIndicator, ListButton, request, useGlobalContext} from 'strapi-helper-plugin';
import {Table, Button} from '@buffetjs/core';
import {Plus} from '@buffetjs/icons';
import {Header} from '@buffetjs/custom';
import {Link, useHistory} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLink, faFileExport, faFileImport, faPencilAlt, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {Duplicate} from '@buffetjs/icons';
import styled from 'styled-components';
import {isEmpty, pick} from 'lodash';
import getTrad from '../../utils/getTrad';
import pluginId from '../../pluginId';
import {Tooltip} from '@buffetjs/styles';
import moment from 'moment';

const getUrl = (to) => (to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`);

const Wrapper = styled.div`
  margin-bottom: 30px;
`;

const CustomTable = styled(Table)`
  p {margin-bottom: 0};
  tr, td {height: 54px !important};
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

const HomePage = () => {
  const {push} = useHistory();
  const {formatMessage, plugins} = useGlobalContext();
  const [templates, setTemplates] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [duplicateConfirmationModal, setDuplicateConfirmationModal] = useState(false);
  const [importConfirmationModal, setImportConfirmationModal] = useState(false);

  useEffect(() => {
    (async () => {
      let templatesData = await request(`/${pluginId}/templates`, {
        method: 'GET',
      });
      templatesData.forEach(data => {
        data.enabled = data.enabled.toString();
        data.created_at = moment(data.created_at).format('dddd, MMMM Do YYYY');
      });
      setTemplates(templatesData.map((row) => pick(row, ['id', 'name', 'enabled', 'created_at'])));
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
        message: {id: getTrad('notification.impossibleToDuplicate')},
      });
    }
  }, [duplicateConfirmationModal, push]);

  const deleteTemplateHandler = useCallback(async () => {
    try {
      const {removed} = await request(`/${pluginId}/templates/${deleteConfirmationModal}`, {
        method: 'DELETE',
      });

      if (removed) {
        setTemplates((state) => state.filter((el) => el.id !== deleteConfirmationModal));
        setDeleteConfirmationModal(false);
        strapi.notification.toggle({
          type: 'success',
          message: {id: getTrad('notification.templateDeleted')},
        });
      }
    } catch (error) {
      console.log(error);
      strapi.notification.toggle({
        type: 'warning',
        message: {id: getTrad('notification.impossibileToDeleteTemplate')},
      });
    }
  }, [deleteConfirmationModal]);

  const exportTemplatesHandler = async () => {
    const templates = await request(`/${pluginId}/templates`, {
      method: 'GET',
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates));
    const dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${pluginId}-templates_${moment().unix()}.json`);
    dlAnchorElem.click();
  };

  const fileChangeHandler = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fr = new FileReader();
      fr.onload = async () => {
        const content = JSON.parse(fr.result.toString());
        setImportConfirmationModal(content);
      }

      fr.readAsText(file);
    }
  };

  let importLoading = false;
  const handleTemplatesFromImport = async () => {
    const tpls = importConfirmationModal;
    importLoading = true;
    let importedTemplates = [];
    for (let i = 0; i < tpls.length; i++) {
      const template = tpls[i];
      const response = await request(`/${pluginId}/templates/${template.id}`, { // later templateId
        method: 'POST',
        body: {
          ...template,
          created_at: moment().unix(),
          updated_at: moment().unix(),
        },
      });
      importedTemplates.push(response);
    }

    let newTemplates = [...templates, ...importedTemplates].map(data => {
      data.enabled = data.enabled.toString();
      data.created_at = moment(data.created_at, moment(data.created_at).isValid() ? undefined : 'dddd, MMMM Do YYYY').format('dddd, MMMM Do YYYY');
      return data;
    });
    newTemplates = _.uniqBy(newTemplates, function (e) {
      return e.id;
    });
    setTemplates((state) => newTemplates);

    const email_templates_file_select = document.getElementById('email_templates_file_select');
    email_templates_file_select.value = '';
    setImportConfirmationModal(undefined);
    importLoading = false;
  };

  const headers = [
    {name: formatMessage({id: getTrad('table.name')}), value: 'name'},
    {name: 'Template ID', value: 'id'},
    {name: 'Enabled', value: 'enabled'},
    {name: 'Created At', value: 'created_at'},
  ];

  return (
    <div className="container-fluid" style={{padding: '18px 30px 66px 30px'}}>
      <PopUpWarning
        isConfirmButtonLoading={importLoading}
        isOpen={importConfirmationModal && importConfirmationModal.length > 0}
        content={{
          title: getTrad('pleaseConfirm'),
          message: getTrad('notification.importTemplate'),
        }}
        popUpWarningType="danger"
        toggleModal={() => {
          const email_templates_file_select = document.getElementById('email_templates_file_select');
          email_templates_file_select.value = '';
          setImportConfirmationModal(undefined);
        }}
        onConfirm={async () => {
          await handleTemplatesFromImport();
        }}
      />
      <PopUpWarning
        isOpen={typeof duplicateConfirmationModal === 'number'}
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
        isOpen={typeof deleteConfirmationModal === 'number'}
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
          {
            label: formatMessage({id: getTrad('newTemplate')}),
            onClick: () => push(getUrl(`design/new`)),
            color: 'primary',
            type: 'button',
            icon: true,
          },
        ]}
        title={{
          label: formatMessage({id: getTrad('plugin.name')}),
        }}
        content={formatMessage({id: getTrad('header.description')})}
      />

      {!plugins[pluginId].isReady && <LoadingIndicator/>}

      <Wrapper>
        <CustomTable
          className={'remove-margin'}
          headers={headers}
          rows={templates}
          // customRow={this.CustomRow}
          onClickRow={(e, data) => {
            push(getUrl(`design/${data.id}`));
          }}
          rowLinks={[
            {
              icon: <>
                <div
                  data-for="duplicate"
                  data-tip={'Duplicate'}
                >
                  <Duplicate fill={'#000000'}/>
                </div>
                <Tooltip id={'duplicate'}/>
              </>,
              onClick: (data) => setDuplicateConfirmationModal(data.id),
            },
            {
              icon:
                <>
                  <div
                    data-for="edit"
                    data-tip={'Edit'}
                  >
                    <FontAwesomeIcon icon={faPencilAlt}/>
                  </div>
                  <Tooltip id={'edit'}/>
                </>
              ,
              onClick: (data) => {
                push(getUrl(`design/${data.id}`));
              },
            },
            {
              icon: <>
                <div
                  data-for="copy_template_id"
                  data-tip={'Copy Template ID'}
                >
                  <FontAwesomeIcon icon={faLink}/>
                </div>
                <Tooltip id={'copy_template_id'}/>
              </>,
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
              icon: <>
                <div
                  data-for="delete_template"
                  data-tip={'Delete Template'}
                >
                  <FontAwesomeIcon icon={faTrashAlt}/>
                </div>
                <Tooltip id={'delete_template'}/>
              </>,
              onClick: (data) => setDeleteConfirmationModal(data.id),
            },
          ]}
        />
      </Wrapper>
      <FooterWrapper>
        <Link to={`/plugins/${pluginId}/how-to`}>{formatMessage({id: getTrad('howToUse.link')})}</Link>
        <FooterButtonsWrapper>
          <Button onClick={() => exportTemplatesHandler()} color={'success'} icon={<FontAwesomeIcon icon={faFileExport}/>}>
            {formatMessage({id: getTrad('templates.exportTemplates')})}
          </Button>
          <a id={'downloadAnchorElem'} style={{'display': 'none'}}/>
          <Button onClick={() =>{
            const email_templates_file_select = document.getElementById('email_templates_file_select');
            email_templates_file_select.click();
          }} color={'delete'} icon={<FontAwesomeIcon icon={faFileImport}/>}>
            {formatMessage({id: getTrad('templates.importTemplates')})}
          </Button>
          <span style={{display: 'none'}}>
            <input type="file"
                   id="email_templates_file_select"
                   onChange={fileChangeHandler}/>
          </span>
        </FooterButtonsWrapper>
      </FooterWrapper>
    </div>
  );
};

export default memo(HomePage);
