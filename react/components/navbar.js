const React = require("react");
const PropTypes = require("prop-types");

const EdwinLinks = require("../../express/constants/edwinlinks.js");
const SettingsLinks = require("../../express/constants/settingslinks.js");
const NewBaseNavbar = require("./basenavbar.js");

class Navbar extends React.Component {
  static _renderCopyright() {
    return <div className="has-text-centered is-size-7 mb-2">
      <p>Copyright <a href="https://comstedition.com/" className="has-text-white">ComST Edition</a> - © Edwin {new Date().getFullYear()}</p>
    </div>;
  }

  constructor(props) {
    super(props);

    this.base = "/";

    this._handleScrollBarOpen = this._handleScrollBarOpen.bind(this);

    this.state = {opened: false};
  }

  _handleScrollBarOpen() {
    this.setState(prevstate => ({opened: !prevstate.opened}));
  }

  _renderModule(edwinModule) {
    const actions = Array.isArray(edwinModule.routes) ? edwinModule.routes.reduce((acc, route) => {
      if (!route.canAccess || route.canAccess(this.props.user, this.options)) {
        const href = route.query
          ? `${route.href}?${route.query}`
          : `${route.href}`;
        acc.push({
          name: route.label,
          href,
        });
      }
      return acc;
    }, []) : null;
    // if (!actions.length) return null;

    const img = edwinModule.logo;
    const title = actions === null
      ? <a
          className="action menu-label"
          href={edwinModule.routes}
      >
        {edwinModule.label}</a>
      : edwinModule.label;

    return <div key={`menu-label-${edwinModule.label}`}>
      <p className="action menu-label">
        {img && <img src={img} />}
        {title}
      </p>
      <ul className={"menu-list marged"}>
        {actions !== null && actions.map(action => <li
          key={`${title}-${action.name}`}
          className={`action${action.disabled ? " disabled" : ""}`}
        >
          <a href={action.disabled ? null : action.href}>{action.name}</a>
        </li>)}
      </ul>
    </div>;
  }

  _renderHead() {
    const logo = "/images/logo_light.png";

    return <a href={this.base}>
      <figure>
        <img className="logo ml-4 mt-5 mb-4" src={logo} />
      </figure>
    </a>;
  }

  render() {
    const links = this.props.settings ? Object.keys(SettingsLinks) : Object.keys(EdwinLinks);
    const test = this.props.settings ? SettingsLinks : EdwinLinks;
    return (<div>
      <NewBaseNavbar
        base={this.base}
        hasScrollBar
        scrollBarOpened={this.state.opened}
        scrollBarOnClick={this._handleScrollBarOpen}
        hrefLogout="/logout"
        defaultLogo={"/images/small_logo_light.png"}
        // logo={this.props.society.logo}
        user={this.props.user}
      />

      <div className={this.state.opened ? "scrollbar opened" : "scrollbar"}>
        {this._renderHead()}
        <aside className="menu">
          {links.map(link => this._renderModule(test[link]))}
        </aside>
        <div className="bottom">
          {Navbar._renderCopyright()}
        </div>
      </div>
    </div>);
  }
}
Navbar.displayName = "Navbar";
Navbar.propTypes = {
  user: PropTypes.object,
  settings: PropTypes.bool,
};
Navbar.defaultProps = {
  user: undefined,
  settings: false,
};

module.exports = Navbar;
