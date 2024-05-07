const React = require("react");
const PropTypes = require("prop-types");

const Icon = require("../bulma/icon.js");
const Input = require("../bulma/input.js");
const Field = require("../bulma/field.js");

const expectedKeyPress = [
  "ArrowDown",
  "ArrowUp",
  "Enter",
  "Tab",
  "Escape",
];

class DynamicSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: "",
      rows: [],
      qId: 0,
      focus: -1,
      show: false,
      selected: props.selected || null,
    };
    if (props.selected && props.getInputValueFromRow) {
      this.state.input = props.getInputValueFromRow(props.selected);
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleLosesFocus = this.handleLosesFocus.bind(this);
  }

  componentDidMount() {
    if (!this.props.noPreload) {
      this.doSearch();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.qId > prevState.qId) {
      this.doSearch();
    }
    if (this.state.propagate && !prevState.propagate) {
      this.doPropagate();
    }
    if (this.state.show && !prevState.show) {
      this.doSearch();
    }
  }

  doSearch() {
    const qId = this.state.qId;
    this.props.searchFn({
      qId,
      input: this.state.input,
    })
      .then(rows => {
        this.setState(prevState => {
          if (prevState.qId > qId) return {};
          return {
            focus: -1,
            rows,
          };
        });
      })
      .catch(() => {
        // TODO handle error
      });
  }

  doPropagate() {
    this.props.onChange(
      {
        target: {
          name: this.props.name,
          value: this.state.selected,
        },
      },
      this.state.selected,
    );
    this.setState({propagate: false});
  }

  handleChange(evt) {
    this.setState(prevState => ({
      qId: prevState.qId + 1,
      input: evt.target.value,
      selected: null,
      lastSelected: prevState.selected || prevState.lastSelected,
      propagate: true,
      show: true,
    }));
  }

  handleFocus() {
    this.setState({show: true});
  }

  handleKeyPress(evt) {
    if (!this.state.show || !expectedKeyPress.includes(evt.key)) return;

    if (evt.key === "ArrowDown") {
      this.setState(prevState => ({
        focus: prevState.focus < prevState.rows.length - 1
          ? prevState.focus + 1
          : prevState.focus,
      }));
    } else if (evt.key === "ArrowUp") {
      this.setState(prevState => ({
        focus: prevState.focus > -1
          ? prevState.focus - 1
          : prevState.focus,
      }));
    } else if (evt.key === "Enter" || evt.key === "Tab") {
      this.setState(prevState => {
        const target = prevState.focus === -1 && prevState.rows.length === 1
          ? 0
          : this.state.focus;
        if (target === -1) return {};
        const selected = prevState.rows[target];

        return {
          value: this.props.field
            ? prevState.rows[target][this.props.field]
            : prevState.rows[target],
          input: selected
            ? this.props.getInputValueFromRow(selected)
            : prevState.input,
          propagate: true,
          show: false,
          selected,
        };
      });
    } else if (evt.key === "Escape") {
      this.setState({show: false});
    }
  }

  handleLosesFocus() {
    this.setState(prevState => {
      const newState = {show: false};
      if (!prevState.selected) {
        if (this.props.keepLastValid && prevState.lastSelected) {
          newState.input = this.props.getInputValueFromRow(prevState.lastSelected);
          newState.selected = prevState.lastSelected;
          newState.lastSelected = null;
        } else {
          newState.input = "";
          newState.lastSelected = null;
        }
      }
      return newState;
    });
  }

  handleRowClick(evt) {
    const el = evt.target;
    const entryId = parseInt(el.dataset.entryid, 10);
    const selected = this.state.rows.find(e => e.id === entryId);
    this.setState(prevState => ({
      input: selected
        ? this.props.getInputValueFromRow(selected)
        : prevState.input,
      propagate: true,
      show: false,
      selected,
    }));
  }

  _renderHints() {
    if (!this.state.show) return null;
    if (this.state.rows.length === 0) {
      return <div className="has-background-warning">
        <Icon icon="info" />
        Aucun résultat
      </div>;
    }
    return <div className="autocomplete-items">
      {this.state.rows.map((e, i) => <div
        key={`${this.props.name}-${e.id}`}
        data-entryid={e.id}
        className={this.state.focus === i ? "autocomplete-active" : ""}
        onMouseDown={this.handleRowClick}
      >
        {this.props.renderRow(e)}
      </div>)}
    </div>;
  }

  render() {
    const {label, subLabel, fieldClassName, horizontal, noLabel, ...props} = this.props;
    const fieldProps = {
      label,
      noLabel,
      subLabel,
      horizontal,
      className: fieldClassName,
      required: props.required,
    };
    delete props.getInputValueFromRow;
    delete props.keepLastValid;
    delete props.noPreload;
    delete props.renderRow;
    delete props.searchFn;
    return <Field {...fieldProps}>
      <div className={`select ${props.className} autocomplete`}>
        <Input
          {...props}
          value={this.state.input}
          autoComplete="off"
          noField
          debouncing
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyPress}
          onBlur={this.handleLosesFocus}
        />
        {this._renderHints()}
      </div>
    </Field>;
  }
}
DynamicSelect.displayName = "DynamicSelect";
DynamicSelect.propTypes = {
  className: PropTypes.string,
  field: PropTypes.string,
  fieldClassName: PropTypes.string,
  getInputValueFromRow: PropTypes.func.isRequired,
  horizontal: PropTypes.bool,
  keepLastValid: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  noLabel: PropTypes.bool,
  noPreload: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  renderRow: PropTypes.func.isRequired,
  searchFn: PropTypes.func.isRequired,
  selected: PropTypes.object,
  subLabel: PropTypes.string,
};
DynamicSelect.defaultProps = {
  className: "",
  field: undefined,
  fieldClassName: undefined,
  horizontal: false,
  keepLastValid: false,
  label: undefined,
  noLabel: false,
  noPreload: false,
  selected: null,
  subLabel: undefined,
};

module.exports = DynamicSelect;
