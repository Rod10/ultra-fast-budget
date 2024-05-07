const React = require("react");
const PropTypes = require("prop-types");

const EdwinLinks = require("../../express/constants/edwinlinks.js");
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
    const actions = edwinModule.routes.reduce((acc, route) => {
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
    }, []);
    if (!actions.length) return null;

    const img = edwinModule.logo;
    const title = edwinModule.label;

    return <div key={`menu-label-${title}`}>
      <p className="menu-label">
        {img && <img src={img} />}
        {title}
      </p>
      <ul className={"menu-list marged"}>
        {actions.map(action => <li
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
    const mainDashboard = EdwinLinks.monitoring.routes[0];
    return (<div>
      <NewBaseNavbar
        base={this.base}
        hasScrollBar
        scrollBarOpened={this.state.opened}
        scrollBarOnClick={this._handleScrollBarOpen}
        hrefLogout="/society/logout"
        defaultLogo={"/images/small_logo_light.png"}
        logo={this.props.society.logo}
        user={this.props.user}
      />

      <div className={this.state.opened ? "scrollbar opened" : "scrollbar"}>
        {this._renderHead()}
        <aside className="menu">

          <div className="menu-list">
            <a
              className="action"
              href={`${mainDashboard.href}?${mainDashboard.query}`}
            >Opérations</a>
          </div>

          {this._renderModule(EdwinLinks.operations)}
          {this._renderModule(EdwinLinks.operators)}
          {this._renderModule(EdwinLinks.monitoring)}

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
  society: PropTypes.object,
  user: PropTypes.object,
};
Navbar.defaultProps = {
  society: undefined,
  user: undefined,
};

module.exports = Navbar;
