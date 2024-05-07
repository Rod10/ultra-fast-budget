const React = require("react");
const PropTypes = require("prop-types");

const Icon = require("./icon.js");

class IconButton extends React.Component {
  render() {
    const {icon, size, ...props} = this.props;
    return <a {...props}>
      <Icon icon={icon} size={size} />
    </a>;
  }
}
IconButton.displayName = "IconButton";
IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  href: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "big", ""]),
};
IconButton.defaultProps = {
  href: undefined,
  size: "",
};

module.exports = IconButton;
