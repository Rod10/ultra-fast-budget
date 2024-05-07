const React = require("react");
const PropTypes = require("prop-types");

class NotificationCmp extends React.Component {
  render() {
    const {children, type, compact, ...props} = this.props;
    if (compact) {
      return <span
        className={`notification ${type} is-compact`}
        {...props}
      >
        {children}
      </span>;
    }
    return <div
      className={`notification ${type}`}
      {...props}
    >
      {children}
    </div>;
  }
}
NotificationCmp.displayName = "Notification";
NotificationCmp.propTypes = {
  children: PropTypes.node.isRequired,
  compact: PropTypes.bool,
  type: PropTypes.string,
};
NotificationCmp.defaultProps = {
  compact: false,
  type: "",
};

module.exports = NotificationCmp;
