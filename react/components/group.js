const React = require("react");
const PropTypes = require("prop-types");

const Icon = require("./bulma/icon.js");

class Group extends React.Component {
  render() {
    let className = "group column is-one-third has-text-centered";
    if (this.props.disabled) {
      className += " disabled";
    }

    return <div className={className}>
      <div className="title is-4">
        {this.props.img && <img src={this.props.img} />}
        {this.props.icon && <Icon size="large" faSize="3x" icon={this.props.icon} />}
        <span style={{whiteSpace: "pre-wrap"}}>{this.props.title}</span>
      </div>
      {this.props.actions.map(action => <a
        key={`${this.props.title}${action.name}`}
        className={`action${action.disabled ? " disabled" : ""}`}
        href={(this.props.disabled || action.disabled) ? null : action.href}
      >{action.name}</a>)}
    </div>;
  }
}
Group.displayName = "Group";
Group.propTypes = {
  actions: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  img: PropTypes.string,
  title: PropTypes.string.isRequired,
};
Group.defaultProps = {
  disabled: false,
  icon: undefined,
  img: undefined,
};

module.exports = Group;
