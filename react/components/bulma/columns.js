const React = require("react");
const PropTypes = require("prop-types");

class Columns extends React.Component {
  render() {
    return <div className={`columns ${this.props.className}`}>
      {this.props.children}
    </div>;
  }
}
Columns.displayName = "Columns";
Columns.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
Columns.defaultProps = {className: ""};

module.exports = Columns;
