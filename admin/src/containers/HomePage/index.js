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
import {faLink, faClipboard, faPencilAlt, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {Duplicate} from '@buffetjs/icons';
import styled from 'styled-components';
import {isEmpty, pick} from 'lodash';
import getTrad from '../../utils/getTrad';
import pluginId from '../../pluginId';
import {Tooltip} from '@buffetjs/styles';

const getUrl = (to) => (to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`);

const Wrapper = styled.div`
  margin-bottom: 30px;
`;

const CustomTable = styled(Table)`
  p {margin-bottom: 0};
  tr, td {height: 54px !important};
`;

const HomePage = () => {
  const {push} = useHistory();
  const {formatMessage, plugins} = useGlobalContext();
  const [templates, setTemplates] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [duplicateConfirmationModal, setDuplicateConfirmationModal] = useState(false);

  useEffect(() => {
    (async () => {
      const templatesData = await request(`/${pluginId}/templates`, {
        method: 'GET',
      });
      setTemplates(templatesData.map((row) => pick(row, ['id', 'name', 'enabled', 'createdAt'])));
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

  const headers = [
    {name: formatMessage({id: getTrad('table.name')}), value: 'name'},
    {name: 'Template ID', value: 'id'},
  ];

  return (
    <div className="container-fluid" style={{padding: '18px 30px 66px 30px'}}>
      <PopUpWarning
        isOpen={!isEmpty(duplicateConfirmationModal)}
        content={{
          title: getTrad('pleaseConfirm'),
          message: getTrad('questions.sureToDuplicate'),
        }}
        popUpWarningType="danger"
        toggleModal={() => setDuplicateConfirmationModal(false)}
        onConfirm={async () => {
          duplicateTemplateHandler();
        }}
      />
      <PopUpWarning
        isOpen={!isEmpty(deleteConfirmationModal)}
        content={{
          title: getTrad('pleaseConfirm'),
          message: getTrad('questions.sureToDelete'),
        }}
        popUpWarningType="danger"
        toggleModal={() => setDeleteConfirmationModal(false)}
        onConfirm={async () => {
          deleteTemplateHandler();
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
      <Link to={`/plugins/${pluginId}/how-to`}>{formatMessage({id: getTrad('howToUse.link')})}</Link>
    </div>
  );
};

export default memo(HomePage);
