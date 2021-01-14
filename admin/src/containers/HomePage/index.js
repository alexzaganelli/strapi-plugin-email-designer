/*
 *
 * HomePage
 *
 * Reference: https://strapi.io/documentation/developer-docs/latest/plugin-development/frontend-development.html#environment-setup
 */

import React, { memo, useState, useEffect, useCallback } from "react";
// import PropTypes from 'prop-types';
import { PopUpWarning, LoadingIndicator, PluginHeader, request, useGlobalContext } from "strapi-helper-plugin";
import { Table, Button } from "@buffetjs/core";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faClipboard, faPencilAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { isEmpty, pick } from "lodash";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import sunburst from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";

import styled from "styled-components";
import Row from "../../components/Row";
import Block from "../../components/Block";
import getTrad from "../../utils/getTrad";
import pluginId from "../../pluginId";
import TabsNav from "../../components/Tabs";

const getUrl = (to) => (to ? `/plugins/${pluginId}/${to}` : `/plugins/${pluginId}`);

const TableBottom = styled.div`
  button {
    width: 100%;
    height: 54px;
    border: 0;
    border-top: 1px solid #aed4fb;
    color: #007eff;
    font-weight: 500;
    text-transform: uppercase;
    background-color: #e6f0fb;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
  }
`;

const HomePage = () => {
  const { push } = useHistory();
  const { formatMessage, plugins } = useGlobalContext();
  const [templates, setTemplates] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [duplicateConfirmationModal, setDuplicateConfirmationModal] = useState(false);
  const [activeTab, setActiveTab] = useState("listEmailTemplates");

  useEffect(() => {
    (async () => {
      const templatesData = await request(`/${pluginId}/templates`, { method: "GET" });
      setTemplates(templatesData.map((row) => pick(row, ["id", "name", "enabled", "createdAt"])));
    })();
  }, []);

  const duplicateTemplateHandler = useCallback(async () => {
    try {
      const response = await request(`/${pluginId}/templates/duplicate/${duplicateConfirmationModal}`, { method: "POST" });
      push(getUrl(`design/${response.id}`));
    } catch (error) {
      strapi.notification.toggle({
        type: "warning",
        message: { id: getTrad("notification.impossibleToDuplicate") },
      });
    }
  }, [duplicateConfirmationModal, push]);

  const deleteTemplateHandler = useCallback(async () => {
    try {
      const { removed } = await request(`/${pluginId}/templates/${deleteConfirmationModal}`, { method: "DELETE" });

      if (removed) {
        setTemplates((state) => state.filter((el) => el.id !== deleteConfirmationModal));
        setDeleteConfirmationModal(false);
        strapi.notification.toggle({
          type: "success",
          message: { id: getTrad("notification.templateDeleted") },
        });
      }
    } catch (error) {
      console.log(error);
      strapi.notification.toggle({
        type: "warning",
        message: { id: getTrad("notification.impossibileToDeleteTemplate") },
      });
    }
  }, [deleteConfirmationModal]);

  const headers = [
    { name: formatMessage({ id: getTrad("table.name") }), value: "name" },
    { name: "ID", value: "id" },
  ];

  return (
    <div className="container-fluid" style={{ padding: "18px 30px" }}>
      <PopUpWarning
        isOpen={!isEmpty(duplicateConfirmationModal)}
        content={{
          title: getTrad("pleaseConfirm"),
          message: getTrad("questions.sureToDuplicate"),
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
          title: getTrad("pleaseConfirm"),
          message: getTrad("questions.sureToDelete"),
        }}
        popUpWarningType="danger"
        toggleModal={() => setDeleteConfirmationModal(false)}
        onConfirm={async () => {
          deleteTemplateHandler();
        }}
      />
      <Row className="row">
        <div className="col-sm-6">
          <PluginHeader title="Email Designer" description="Design your own templates" />
        </div>
        <div className="col-sm-6 text-right">
          <Button label={formatMessage({ id: getTrad("newTemplate") })} onClick={() => push(getUrl(`design/new`))} />
        </div>
      </Row>
      {!plugins[pluginId].isReady && <LoadingIndicator />}

      <TabsNav
        style={{ display: "flex-inline", marginTop: "0.4rem" }}
        links={[
          {
            isActive: activeTab === "listEmailTemplates",
            name: getTrad("listEmailTemplates"),
            onClick: () => setActiveTab("listEmailTemplates"),
          },
          {
            isActive: activeTab === "howToUse",
            name: getTrad("howToUse"),
            onClick: () => setActiveTab("howToUse"),
          },
        ]}
      />

      <div className="row" style={{ display: activeTab === "listEmailTemplates" ? "block" : "none" }}>
        <Block>
          <Table
            headers={headers}
            rows={templates}
            // onClickRow={(e, data) => {}}
            // customRow={this.CustomRow}
            rowLinks={[
              // @todo would be great to add popper for each action
              {
                icon: <FontAwesomeIcon icon={faPencilAlt} />,
                onClick: (data) => {
                  push(getUrl(`design/${data.id}`));
                },
              },
              {
                icon: <FontAwesomeIcon icon={faClipboard} />,
                onClick: (data) => {
                  navigator.clipboard.writeText(`${data.id}`).then(
                    function () {
                      strapi.notification.toggle({
                        type: "success",
                        message: { id: getTrad("notification.templateIdCopied") },
                      });
                      console.log("Template ID copied to clipboard successfully!");
                    },
                    function (err) {
                      console.error("Could not copy text: ", err);
                    }
                  );
                },
              },
              {
                icon: <FontAwesomeIcon icon={faCopy} />,
                onClick: (data) => setDuplicateConfirmationModal(data.id),
              },
              {
                icon: <FontAwesomeIcon icon={faTrashAlt} />,
                onClick: (data) => setDeleteConfirmationModal(data.id),
              },
            ]}
          />
          <TableBottom>
            <button color="primary" type="button" onClick={() => push(getUrl(`design/new`))}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 13" width="11px" height="11px" fill="#007eff">
                <g data-name="plus symbol">
                  <path d="M6.5.5v12m6-6H.5" fill="none" stroke="#007eff" strokeLinecap="round" />
                </g>
              </svg>
              {` `}
              {formatMessage({ id: getTrad("addNewTemplate") })}
            </button>
          </TableBottom>
        </Block>
      </div>

      <div className="row" style={{ display: activeTab === "howToUse" ? "block" : "none" }}>
        <Block title="Come funziona?" description="Example code">
          <SyntaxHighlighter language="javascript" style={sunburst}>
            {`
            {
              const templateId = "[GET_THE_TEMPLATE_ID]",
              to: "jhon@doe.com",
              from: "me@example.com",
              replyTo: "no-reply@example.com",
              subject: "[TEST] This is a test using strapi-email-designer",
              userData: {
                firstname: "Alex",
                lastname: "Zaganelli",
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
            }
            `}
          </SyntaxHighlighter>
        </Block>
      </div>
    </div>
  );
};

export default memo(HomePage);
