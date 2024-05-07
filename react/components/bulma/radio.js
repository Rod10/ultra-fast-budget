const React = require("react");
const PropTypes = require("prop-types");

const Field = require("../bulma/field.js");

class Radio extends React.Component {
  constructor(props) {
    super(props);
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
      <label className="radio">
        <input
          type="radio"
          value={text}
          {...props}
        />
        {` ${text}`}
      </label>
    </Field>;
  }
}

Radio.displayName = "Radio";
Radio.propTypes = {
  fieldClassName: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  noLabel: PropTypes.bool,
  onChange: PropTypes.func,
  subLabel: PropTypes.string,
  text: PropTypes.string.isRequired,
};
Radio.defaultProps = {
  fieldClassName: undefined,
  label: undefined,
  noLabel: false,
  onChange: undefined,
  subLabel: undefined,
};

module.exports = Radio;
