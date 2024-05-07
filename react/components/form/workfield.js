const React = require("react");
const PropTypes = require("prop-types");

const WorkFieldConstant = require("../../../express/constants/workfield.js");

const Select = require("../bulma/select.js");

class WorkField extends React.Component {
  render() {
    const {notApplicableOption, options, ...props} = this.props;
    let _options;
    if (options) {
      _options = options;
    } else if (notApplicableOption) {
      _options = [{label: "N/A", value: ""}, ...WorkFieldConstant];
    } else {
      _options = WorkFieldConstant;
    }
    return <Select
      className="is-fullwidth"
      options={_options}
      {...props}
    />;
  }
}
WorkField.displayName = "WorkField";
WorkField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  notApplicableOption: PropTypes.bool,
  options: PropTypes.array,
};
WorkField.defaultProps = {
  label: "Dom. ouvrage / installation",
  name: "workField",
  notApplicableOption: false,
  options: undefined,
};

module.exports = WorkField;
