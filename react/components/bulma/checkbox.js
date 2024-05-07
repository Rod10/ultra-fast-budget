const React = require("react");
const PropTypes = require("prop-types");

const Field = require("../bulma/field.js");

class Checkbox extends React.Component {
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
    const {label, subLabel, fieldClassName, text, noLabel, ...props} = this.props;
    return <Field
      label={label}
      subLabel={subLabel}
      className={fieldClassName}
      noLabel={noLabel}
      required={props.required}
    >
      <label className="checkbox">
        <input
          type="checkbox"
          value="checked"
          {...props}
          onChange={this.handleChange}
        />
        {` ${text}`}
      </label>
    </Field>;
  }
}
Checkbox.displayName = "Checkbox";
Checkbox.propTypes = {
  fieldClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  noLabel: PropTypes.bool,
  onChange: PropTypes.func,
  subLabel: PropTypes.string,
  text: PropTypes.string.isRequired,
};
Checkbox.defaultProps = {
  fieldClassName: undefined,
  label: undefined,
  noLabel: false,
  onChange: undefined,
  subLabel: undefined,
};

module.exports = Checkbox;
