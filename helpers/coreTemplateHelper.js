module.exports = {
  standardEmailRegistrationTemplate: {
    counters: { u_row: 2, u_content_text: 1, u_content_image: 1, u_column: 2 },
    body: {
      values: {
        backgroundColor: '#ffffff',
        linkStyle: {
          body: true,
          linkHoverColor: '#0000ee',
          linkHoverUnderline: true,
          linkColor: '#0000ee',
          linkUnderline: true,
        },
        contentWidth: '500px',
        backgroundImage: { repeat: false, center: true, fullWidth: true, url: '', cover: false },
        contentAlign: 'center',
        textColor: '#000000',
        _meta: { htmlID: 'u_body', htmlClassNames: 'u_body' },
        fontFamily: { label: 'Arial', value: 'arial,helvetica,sans-serif' },
        preheaderText: '',
      },
      rows: [
        {
          cells: [1],
          values: {
            backgroundImage: { cover: false, url: '', repeat: false, fullWidth: true, center: true },
            hideDesktop: false,
            selectable: true,
            columnsBackgroundColor: '',
            hideable: true,
            backgroundColor: '',
            padding: '0px',
            columns: false,
            _meta: { htmlID: 'u_row_2', htmlClassNames: 'u_row' },
            deletable: true,
            displayCondition: null,
            duplicatable: true,
            draggable: true,
          },
          columns: [
            {
              contents: [
                {
                  values: {
                    hideDesktop: false,
                    duplicatable: true,
                    deletable: true,
                    linkStyle: {
                      linkHoverUnderline: true,
                      linkColor: '#0000ee',
                      inherit: true,
                      linkUnderline: true,
                      linkHoverColor: '#0000ee',
                    },
                    hideable: true,
                    lineHeight: '140%',
                    draggable: true,
                    containerPadding: '10px',
                    text:
                      '<p style="font-size: 14px; line-height: 140%; text-align: center;"><span style="font-size: 14px; line-height: 19.6px;">__PLACEHOLDER__</span></p>',
                    _meta: { htmlID: 'u_content_text_1', htmlClassNames: 'u_content_text' },
                    textAlign: 'left',
                    selectable: true,
                  },
                  type: 'text',
                },
              ],
              values: {
                border: {},
                _meta: { htmlClassNames: 'u_column', htmlID: 'u_column_2' },
                backgroundColor: '',
                padding: '0px',
              },
            },
          ],
        },
      ],
    },
    schemaVersion: 6,
  },
};
