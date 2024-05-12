const React = require("react");
const PropTypes = require("prop-types");
const Civilities = require("../../express/constants/civilities.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");

class Basenavbar extends React.Component {
  static _renderLogo(src, alt) {
    return <img
      src={src}
      alt={alt || "Edwin"}
      height={32}
    />;
  }

  static _renderScrollbarButton(show, opened, handle) {
    if (show === false) {
      return null;
    }
    return <div
      className={opened ? "scrollbar-button opened" : "scrollbar-button"}
      onClick={handle}
    >
      <span />
      <span />
      <span />
    </div>;
  }

  _renderBrand() {
    return <div className="navbar-brand">
      <a className="navbar-item logo" href={this.props.base}>
        {Basenavbar._renderLogo(
          this.props.logo
            ? `/logos/${this.props.logo}`
            : this.props.defaultLogo,
          this.props.logoTitle,
        )}
      </a>
      {this.props.brandContent}
    </div>;
  }

  _renderLogout() {
    return <div className="navbar-item">
      <Button
        label={"Déconnexion"}
        icon={<Icon
          icon="arrow-right-from-bracket"
          faSize="lg"
          size="big"
        />}
        href={this.props.hrefLogout || `${this.props.base}/logout`}
      />
    </div>;
  }

  _renderSettings() {
    return <div className="navbar-item">
      <Button
        label={""}
        icon={<Icon
          icon="gear"
          faSize="lg"
          size="big"
        />}
        href="/settings"
      />
    </div>;
  }

  _renderMenu() {
    const c = this.props.user;
    return <div className={"navbar-menu"}>
      <div className="navbar-start">
        {this.props.navbarLeft}
      </div>
      {this.props.navbarCenter}
      <div className="navbar-end">
        {this._renderSettings()}
        <span className="navbar-item is-hidden-touch">{Civilities[c.civility].short}. {c.firstName} {c.lastName}</span>
        {this.props.navbarRight}
        {this._renderLogout()}
      </div>
    </div>;
  }

  render() {
    return <div
      className="navbar is-fixed-top is-transparent"
      role="navigation"
    >
      <div className="container is-fluid">
        {Basenavbar._renderScrollbarButton(
          this.props.hasScrollBar,
          this.props.scrollBarOpened,
          this.props.scrollBarOnClick,
        )}
        {this._renderBrand()}
        {this._renderMenu()}
      </div>
    </div>;
  }
}
Basenavbar.displayName = "Basenavbar";
Basenavbar.propTypes = {
  base: PropTypes.string.isRequired,
  brandContent: PropTypes.node,
  hasScrollBar: PropTypes.bool,
  scrollBarOpened: PropTypes.bool,
  scrollBarOnClick: PropTypes.func,
  hrefLogout: PropTypes.string,
  defaultLogo: PropTypes.string,
  logo: PropTypes.string,
  logoTitle: PropTypes.string,
  navbarLeft: PropTypes.node,
  navbarCenter: PropTypes.node,
  navbarRight: PropTypes.node,
  user: PropTypes.object,
};
Basenavbar.defaultProps = {
  brandContent: undefined,
  hasScrollBar: false,
  scrollBarOpened: false,
  scrollBarOnClick: undefined,
  hrefLogout: undefined,
  defaultLogo: undefined,
  logo: undefined,
  logoTitle: undefined,
  navbarLeft: undefined,
  navbarCenter: undefined,
  navbarRight: undefined,
  user: undefined,
};

module.exports = Basenavbar;
