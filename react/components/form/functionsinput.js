const React = require("react");
const PropTypes = require("prop-types");

const FunctionsFull = require("../../../express/constants/functionsfull.js");
const {
  getUntoggleableForSociety,
  getUntoggleableFunctionsSimple,
} = require("../../../express/utils/society.js");
const {preventDefault} = require("../../utils/html.js");

class FunctionsInput extends React.Component {
  constructor(props) {
    super(props);

    const op = this.props.operator;

    this.state = {
      selected: op.cf.filter(e => e.state === "ACTIVE")
        .map(e => e.name),
    };

    this.handleChange = this.handleChange.bind(this);
    if (this.props.society && this.props.user) {
      this.cantToggle = getUntoggleableForSociety(this.props.society, this.props.user)
        .cantToggleFunc;
    } else {
      this.cantToggle = getUntoggleableFunctionsSimple();
    }
  }

  render() {
    const options = Array.from(this.props.functions)
      .sort((func1, func2) => FunctionsFull[func1].name.localeCompare(FunctionsFull[func2].name))
      .map(func => <option
        key={func}
        value={func}
        disabled={this.cantToggle.includes(func)}
      >{FunctionsFull[func].name}</option>);

    return <div className="select is-multiple is-fullwidth">
      <select
        multiple
        size={3}
        name={"functions"}
        required
        onChange={this.handleChange}
        value={this.state.selected}
      >
        {options}
      </select>
    </div>;
  }

  handleChange(evt) {
    preventDefault(evt);

    // get a list of selected functions
    const selectedEntries = [...evt.target.options]
      .filter(({selected}) => selected)
      .map(({value}) => value);

    this.setState({selected: selectedEntries});
  }
}
FunctionsInput.displayName = "FunctionsInput";
FunctionsInput.propTypes = {
  functions: PropTypes.array,
  operator: PropTypes.object,
  society: PropTypes.object,
  user: PropTypes.object,
};
FunctionsInput.defaultProps = {
  functions: [],
  operator: null,
};

module.exports = FunctionsInput;
