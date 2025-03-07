const React = require("react");
const PropTypes = require("prop-types");
const {
  default: OrigDatePicker,
  registerLocale,
  setDefaultLocale,
} = require("react-datepicker");
const dateFns = require("date-fns");
const fr = require("date-fns/locale/fr/index.js");

const {dateFormat, dateTimeFormat, timeFormat} = require("../../express/utils/dateformat.js");

registerLocale("fr", fr.default || fr);
setDefaultLocale("fr");

class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.internalRef = React.createRef();
  }

  componentDidMount() {
    if (this.internalRef.current) {
      if (this.props.selected) {
        this.internalRef.current.input.value = dateFns.format(
          new Date(this.props.selected),
          this.props.showTimeSelect ? dateTimeFormat : dateFormat,
        );
      } else {
        this.internalRef.current.input.value = "";
      }
      if (this.props.inputRef) {
        this.props.inputRef.current = this.internalRef.current.input;
      }
    }
  }

  componentWillUnmount() {
    if (this.props.inputRef) {
      this.props.inputRef.current = null;
    }
  }

  handleChange(date, evt) {
    this.props.onChange({
      nativeEvent: evt,
      target: {
        name: this.props.name,
        value: date,
      },
    });
  }

  render() {
    /* inputRef must not be forwarded, ence it is extracted from props */
    /* eslint-disable-next-line no-unused-vars */
    const {onChange, onChangeLegacy, inputRef, value, showTimeSelect, ...props} = this.props;
    let changeHandler;
    if (onChangeLegacy) {
      changeHandler = onChangeLegacy;
    } else if (onChange) {
      changeHandler = this.handleChange;
    }
    return <OrigDatePicker
      className="input"
      placeholder="jj/mm/aaaa"
      dateFormat={showTimeSelect ? dateTimeFormat : dateFormat}
      timeCaption="Heure"
      timeFormat={timeFormat}
      timeIntervals={15}
      isClearable={!this.props.readOnly && !this.props.required}
      showTimeSelect={showTimeSelect}
      {...props}
      selected={value || props.selected}
      onChange={changeHandler}
      ref={this.internalRef}
    />;
  }
}
DatePicker.displayName = "DatePicker";
DatePicker.format = {
  date: dateFormat,
  dateTime: dateTimeFormat,
  time: timeFormat,
};
DatePicker.propTypes = {
  inputRef: PropTypes.object,
  // TODO should be required
  name: PropTypes.string,
  onChange: PropTypes.func,
  onChangeLegacy: PropTypes.func,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  selected: PropTypes.object,
  showTimeSelect: PropTypes.bool,
  value: PropTypes.object,
};
DatePicker.defaultProps = {
  inputRef: undefined,
  name: undefined,
  onChange: undefined,
  onChangeLegacy: undefined,
  readOnly: false,
  required: false,
  selected: undefined,
  showTimeSelect: false,
  value: undefined,
};

module.exports = DatePicker;
