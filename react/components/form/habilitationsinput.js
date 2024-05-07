const React = require("react");
const PropTypes = require("prop-types");

const Select = require("../bulma/select.js");

const HabilitationsSets = require("../../../express/constants/habilitationssets.js");
const HabilitationLevels = require("../../../express/constants/habilitationlevels.js");
const HabilitationTypes = require("../../../express/constants/habilitationtypes.js");
const {objectAsIterable} = require("../utils.js");

class HabilitationsInput extends React.Component {
  constructor(props) {
    super(props);

    let options = props.options;
    if (!options) {
      options = (props.habilitationType === "all"
        ? HabilitationLevels
        : HabilitationLevels.filter(e => !e.type || e.type === props.habilitationType))
        .map(e => ({value: e.level, label: e.level}));
    }
    this.state = {options};
  }

  componentDidUpdate(prevProps) {
    if (this.props.habilitationType !== prevProps.habilitationType) {
      this.setState({
        options: this.props.options
        || objectAsIterable(HabilitationsSets[this.props.habilitationType])
          .map(e => ({
            value: e.key,
            label: e.level,
          })),
      });
    }
    if (this.props.options !== prevProps.options) {
      this.setState({options: this.props.options});
    }
  }

  render() {
    /* habilitationType is extracted to not propagate it further */
    /* eslint-disable-next-line no-unused-vars */
    const {habilitationType, hidden, ...props} = this.props;
    return <Select
      fieldClassName={hidden ? "is-hidden" : ""}
      label="Niveau"
      value={[]}
      {...props}
      options={this.state.options}
    />;
  }
}
HabilitationsInput.displayName = "HabilitationsInput";
HabilitationsInput.propTypes = {
  habilitationType: PropTypes.string,
  hidden: PropTypes.bool,
  options: PropTypes.array,
};
HabilitationsInput.defaultProps = {
  habilitationType: HabilitationTypes.ELECTRICITY,
  hidden: false,
  options: undefined,
};

module.exports = HabilitationsInput;
