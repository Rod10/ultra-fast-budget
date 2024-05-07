const React = require("react");
const PropTypes = require("prop-types");

const Select = require("../bulma/select.js");

const {objectAsIterable} = require("../utils.js");
const civilities = objectAsIterable(require("../../../express/constants/civilities.js"));

class OperatorCivility extends React.Component {
  constructor(props) {
    super(props);

    this.options = civilities.map(e => ({value: e.key, label: e[props.labelType]}));
  }

  render() {
    /* labelType is extracted to not propagate it further */
    /* eslint-disable-next-line no-unused-vars */
    const {labelType, ...props} = this.props;
    return <Select
      label="Civilité"
      options={this.options}
      {...props}
    />;
  }
}
OperatorCivility.displayName = "OperatorCivility";
OperatorCivility.propTypes = {
  labelType: PropTypes.string,
  name: PropTypes.string.isRequired,
};
OperatorCivility.defaultProps = {labelType: "long"};

module.exports = OperatorCivility;
