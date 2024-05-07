const React = require("react");
const PropTypes = require("prop-types");

class Icon extends React.Component {
  render() {
    const size = this.props.size
      ? `is-${this.props.size}`
      : "";
    const faSize = this.props.faSize
      ? `fa-${this.props.faSize}`
      : "";
    return <span className={`icon ${size}`} title={this.props.title}>
      <i className={`fa fa-${this.props.icon} ${faSize}`} />
    </span>;
  }
}
Icon.displayName = "Icon";
Icon.propTypes = {
  faSize: PropTypes.oneOf(["lg", "2x", "3x"]),
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "big", "large", ""]),
};
Icon.defaultProps = {
  faSize: undefined,
  title: undefined,
  size: undefined,
};

module.exports = Icon;
