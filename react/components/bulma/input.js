const React = require("react");
const PropTypes = require("prop-types");

const Field = require("./field.js");

// 500 ms of debouncing
const inputTimeout = 500;

class Input extends React.Component {
  static getDerivedStateFromProps(props, state) {
    if (props.value === state.prevValue) {
      return {value: state.value};
    }
    return {
      value: props.value,
      prevValue: props.value,
    };
  }

  constructor(props) {
    super(props);

    this.vref = React.createRef();
    this.state = {
      value: props.value || "",
      prevValue: props.value || "",
    };
    this.timeout = null;
    this.handleChange = this.handleChange.bind(this);
    this.spreadChange = this.spreadChange.bind(this);
  }

  componentDidMount() {
    if (this.vref.current && !this.props.value) {
      this.spreadChange();
    }
  }

  spreadChange() {
    if (!this.props.onChange) return;
    if (this.vref.current) {
      this.props.onChange({target: this.vref.current});
    } else {
      this.props.onChange({
        target: {
          name: this.props.name,
          value: this.state.value,
        },
      });
    }
    this.timeout = null;
  }

  handleChange(evt) {
    this.setState({value: evt.target.value});
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.spreadChange, inputTimeout);
  }

  render() {
    /* eslint-disable-next-line max-len */
    const {label, subLabel, fieldClassName, fieldLabelClassName, horizontal, noField, noLabel, debouncing, error, helper, ...props} = this.props;
    if (debouncing) {
      props.onChange = this.handleChange;
      props.value = this.state.value;
    } else {
      props.ref = this.vref;
    }
    if (noField) {
      return <input
        {...props}
        className={`input ${props.className}`}
      />;
    }
    return <Field
      label={label}
      subLabel={subLabel}
      className={fieldClassName}
      fieldLabelClassName={fieldLabelClassName}
      required={props.required}
      horizontal={horizontal}
      error={error}
      helper={helper}
      noLabel={noLabel}
    >
      <input
        {...props}
        className={`input ${props.className}${error ? " is-danger" : ""}`}
      />
    </Field>;
  }
}
Input.displayName = "Input";
Input.propTypes = {
  debouncing: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.string,
  fieldClassName: PropTypes.string,
  fieldLabelClassName: PropTypes.string,
  helper: PropTypes.string,
  horizontal: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  noField: PropTypes.bool,
  noLabel: PropTypes.bool,
  onChange: PropTypes.func,
  subLabel: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
};
Input.defaultProps = {
  debouncing: false,
  className: "",
  error: undefined,
  fieldClassName: undefined,
  fieldLabelClassName: undefined,
  helper: undefined,
  horizontal: false,
  label: undefined,
  noField: false,
  noLabel: false,
  onChange: undefined,
  subLabel: undefined,
  type: "text",
  value: undefined,
};

module.exports = Input;
