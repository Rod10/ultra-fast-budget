const React = require("react");
const PropTypes = require("prop-types");

const Field = require("./field.js");

class Select extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    if (this.props.multiple) {
      const value = Array.from(evt.target.selectedOptions, e => e.value);
      return this.props.onChange(evt, value);
    }
    return this.props.onChange(evt);
  }

  _renderRaw(className, options, error, props) {
    let selectClassName = `select ${className}`;
    if (props.multiple) {
      selectClassName += " is-multiple";
    }
    if ("defaultValue" in props) {
      delete props.value;
    }
    return <div className={`${selectClassName}${error ? " is-danger" : ""}`}>
      <select
        {...props}
        onChange={this.handleChange}
      >
        {options.map(e => <option
          key={`${this.props.name}-${e.value}`}
          disabled={e.disabled}
          value={e.value}
        >
          {e.label || e.value}
        </option>)}
      </select>
    </div>;
  }

  render() {
    const {label, subLabel, fieldClassName, className, options, error, helper, raw, ...props}
      = this.props;
    const selectEl = this._renderRaw(className, options, error, props);
    if (raw) return selectEl;
    return <Field
      label={label}
      subLabel={subLabel}
      className={fieldClassName}
      required={props.required}
      error={error}
      helper={helper}
    >
      {selectEl}
    </Field>;
  }
}
Select.displayName = "Select";
Select.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  fieldClassName: PropTypes.string,
  helper: PropTypes.string,
  label: PropTypes.string,
  multiple: PropTypes.bool,
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  raw: PropTypes.bool,
  subLabel: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
};
Select.defaultProps = {
  className: "",
  error: undefined,
  fieldClassName: undefined,
  helper: undefined,
  label: undefined,
  multiple: false,
  onChange: undefined,
  raw: false,
  subLabel: undefined,
  value: "",
};

module.exports = Select;
