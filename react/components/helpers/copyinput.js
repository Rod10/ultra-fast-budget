const React = require("react");
const PropTypes = require("prop-types");

class CopyInput extends React.Component {
  constructor(props) {
    super(props);

    this.className = [
      "input",
      props.className,
    ]
      .filter(e => e)
      .join(" ");

    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(e) {
    e.target.select();
    navigator.clipboard.writeText(this.props.value);
  }

  render() {
    return <input
      type="text"
      className={this.className}
      style={this.props.style}
      onClick={this.handleOnClick}
      onMouseDown={this.handleOnClick}
      value={this.props.value}
    />;
  }
}
CopyInput.displayName = "CopyInput";
CopyInput.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};
CopyInput.defaultProps = {
  value: undefined,
  className: undefined,
  style: {},
};

module.exports = CopyInput;
