const React = require("react");
const PropTypes = require("prop-types");

// eslint-disable-next-line react/display-name
class Toogle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isChecked: this.props.checked ?? false};

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.checked !== this.props.checked) {
      this.setState({isChecked: this.props.checked});
    }
  }

  handleClick() {
    const result = {value: !this.state.isChecked};
    if (this.props.disabled) {
      return;
    }
    if (typeof this.props.id !== "undefined") {
      result["id"] = this.props.id;
    }

    this.props.onChange(result);

    this.setState(prevState => ({isChecked: !prevState.isChecked}));
  }

  render() {
    const isChecked = this.state.isChecked;
    const nameclass = [];
    nameclass.push(this.props.className);
    nameclass.push("toggle-control");

    if (this.props.disabled) {
      nameclass.push("disabled");
    }
    if (isChecked) {
      nameclass.push("checked");
    }

    return (
      <span>
        <span
          className={nameclass.join(" ")}
          onClick={this.handleClick}
          disabled={this.props.disabled}
        >
          <span className="control" />
        </span>
      </span>
    );
  }
}
Toogle.displayName = "Toogle";
Toogle.propTypes = {
  id: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};
Toogle.defaultProps = {
  disabled: false,
  className: "",
};

module.exports = Toogle;
