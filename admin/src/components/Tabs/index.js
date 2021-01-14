/**
 *
 * TabsNav
 *
 */

import React from "react";
import { FormattedMessage } from "react-intl";
import { darken } from "strapi-helper-plugin";
import { map } from "lodash";

import PropTypes from "prop-types";
import Wrapper from "./Wrapper";

function TabsNav({ links, style }) {
  let linkColor = "#F5F5F5";

  return (
    <Wrapper style={style}>
      {map(links, (link) => {
        linkColor = darken(linkColor, 1.5);

        return (
          <button
            key={link.name}
            type="button"
            className={`headerLink ${link.isActive && "linkActive"}`}
            style={{
              backgroundColor: linkColor,
              cursor: link.disabled ? "not-allowed" : "pointer",
            }}
            onClick={(e) => {
              if (link.disabled) e.preventDefault();
              else if (link.onClick) link.onClick();
            }}
          >
            <div className="linkText text-center">
              <FormattedMessage id={link.name} defaultMessage={link.name} values={link.values} />
              {link.active && <div className="notifPoint" />}
            </div>
          </button>
        );
      })}
    </Wrapper>
  );
}

TabsNav.defaultProps = {
  links: [],
  style: {},
};

TabsNav.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool,
      name: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  style: PropTypes.object,
};

export default TabsNav;
