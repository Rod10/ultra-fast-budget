const React = require("react");
const PropTypes = require("prop-types");

const Input = require("../bulma/input.js");

class PhoneInput extends React.Component {
  static _formatingNum(num) {
    if (!num || !num.length) {
      return "";
    }
    const tmp = num.replaceAll(" ", "").match(/^(?:\+\d{0,2})?\d{0,10}/u);
    if (!tmp) {
      return "";
    }
    return tmp[0].match(/(\+\d{0,2}|\d{1,2})/gu).join(" ");
  }

  constructor(props) {
    super(props);

    this.state = {phone: PhoneInput._formatingNum(this.props.value)};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    this.setState({[evt.target.name]: PhoneInput._formatingNum(evt.target.value)});
  }

  render() {
    return <Input
      {...this.props}
      value={this.state.phone}
      onChange={this.handleChange}
    />;
  }
}
PhoneInput.displayName = "PhoneInput";
PhoneInput.propTypes = {value: PropTypes.string};
PhoneInput.defaultProps = {value: ""};

module.exports = PhoneInput;
