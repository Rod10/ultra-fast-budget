const React = require("react");
const PropTypes = require("prop-types");

class NewCheckbox extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    if (this.props.onChange) {
      this.props.onChange({target: {name: this.props.name, value: evt.target.checked}});
    }
  }

  render() {
    const {text, ...props} = this.props;
    return <div>
      <label className="checkbok-container">
        <input
          type="checkbox"
          value="checked"
          {...props}
          onChange={this.handleChange}
        />
        <span className="checkmark" />
        {` ${text}`}
      </label>
    </div>;
  }
}
NewCheckbox.displayName = "NewCheckbox";
NewCheckbox.propTypes = {
  fieldClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  noLabel: PropTypes.bool,
  onChange: PropTypes.func,
  subLabel: PropTypes.string,
  text: PropTypes.string.isRequired,
};
NewCheckbox.defaultProps = {
  fieldClassName: undefined,
  label: undefined,
  noLabel: false,
  onChange: undefined,
  subLabel: undefined,
};

module.exports = NewCheckbox;
