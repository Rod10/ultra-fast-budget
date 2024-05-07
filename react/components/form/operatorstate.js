const React = require("react");
const PropTypes = require("prop-types");

const Select = require("../bulma/select.js");

const ContributorStates = require("../../../express/constants/contributorstates.js");
const {contributorStates} = require("../../langs/fr.json").constants;

class OperatorState extends React.Component {
  constructor(props) {
    super(props);

    const value = props.value || props.defaultValue || ContributorStates.CREATED;
    this.stateOptions = (value === ContributorStates.CREATED
      ? [ContributorStates.CREATED]
      : [ContributorStates.ACTIVE, ContributorStates.INACTIVE]
    ).map(e => ({
      value: e,
      label: contributorStates[e.value],
    }));
  }

  render() {
    const {...props} = this.props;
    return <Select
      label="État"
      options={this.stateOptions}
      {...props}
    />;
  }
}
OperatorState.displayName = "OperatorState";
OperatorState.propTypes = {
  defaultValue: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
};
OperatorState.defaultProps = {
  defaultValue: undefined,
  value: undefined,
};

module.exports = OperatorState;
