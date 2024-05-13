const React = require("react");
const PropTypes = require("prop-types");

const NewOperatorSelection = require("../newoperatorselectionmodal.js");

const Column = require("../bulma/column.js");
const Columns = require("../bulma/columns.js");
const Input = require("../bulma/input.js");
const HabilitationModal = require("../habilitationmodal.js");

class SelectContributor extends React.Component {
  static renderData1(required, disabled, opFunc, c) {
    return <>
      <Columns>
        <Column size={Column.Sizes.half}>
          <Input
            className="input"
            type="text"
            name={`${opFunc}[civility]`}
            label="Civilité"
            placeholder="Civilité"
            value={c ? c.civility : ""}
            required={required}
            disabled={disabled}
          />
        </Column>
      </Columns>

      <Columns>
        <Column>
          <Input
            className="input"
            type="text"
            name={`${opFunc}[lastName]`}
            label="Nom"
            placeholder="Nom"
            value={c ? c.lastName : ""}
            required={required}
            disabled={disabled}
          />
        </Column>
        <Column>
          <Input
            className="input"
            type="text"
            name={`${opFunc}[firstName]`}
            label="Prénom"
            placeholder="Prénom"
            value={c ? c.firstName : ""}
            required={required}
            disabled={disabled}
          />
        </Column>
      </Columns>
    </>;
  }

  static renderData2(required, disabled, opFunc, c, openModal) {
    return <Columns>
      <Column>
        <Input
          className="input"
          type="text"
          name={`${opFunc}[level]`}
          label="Habilitations"
          placeholder="Habilitations"
          value={c ? c.level : ""}
          required={required}
          disabled={disabled}
          onClick={openModal}
        />
      </Column>
      <Column>
        <Input
          className="input"
          type="text"
          name={`${opFunc}[phone]`}
          label="Téléphone"
          placeholder="Téléphone"
          value={c ? c.phone : ""}
          required={required}
          disabled={disabled}
        />
      </Column>
    </Columns>;
  }

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      modal: null,
    };

    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalToggle = this.handleModalToggle.bind(this);
    this.handleOperatorChange = this.handleOperatorChange.bind(this);
    this.handleOpenHabilitationModal = this.handleOpenHabilitationModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.SelectContributor !== prevProps.SelectContributor) {
      this.setState({visible: false});
    }
  }

  handleModalOpen(e) {
    if (this.props.disabled) return;
    e.preventDefault();

    if (this.props.readOnly) return;
    if (this.state.modal !== "habilitation") {
      this.setState({visible: true});
    } else {
      if (e.currentTarget !== e.target) return;
      this.setState({visible: false});
    }
  }

  handleModalToggle() {
    if (this.props.readOnly) return;
    this.setState(prevState => ({visible: !prevState.visible}));
  }

  handleOpenHabilitationModal(evt) {
    evt.preventDefault();
    if (this.props.contributor !== null) {
      evt.stopPropagation();
      this.setState({modal: "habilitation", visible: false});
    }
  }

  handleCloseModal() {
    this.setState({modal: null});
  }

  handleOperatorChange(operator) {
    if (this.props.disabled) return;
    if (this.props.legacyReturn) {
      this.props.onChange(operator);
    } else {
      this.props.onChange({target: {name: this.props.name, value: operator}});
    }

    this.handleModalToggle();
  }

  renderHiddenInput(c, opFunc) {
    const hide = ["level", "phone", "firstName", "lastName", "civility"];
    const hidden = c
      ? Object.keys(c).filter(key => !hide.includes(key))
      : null;

    return this.props.fields
      ? this.props.fields.map(key => <input key={key} type="hidden" name={`${opFunc}[${key}]`} value={c ? c[key] : ""} />)
      : hidden.map(key => <input key={key} type="hidden" name={`${opFunc}[${key}]`} value={c ? c[key] : ""} />);
  }

  render() {
    const c = this.props.contributor;
    const opFunc = this.props.opFunc;
    const required = this.props.required;
    const disabled = this.props.disabled;
    return <div className="block selection">

      <div className="block" onClick={this.handleModalOpen}>
        {SelectContributor.renderData1(required, disabled, opFunc, c)}
        {SelectContributor.renderData2(required, disabled, opFunc, c, this.handleOpenHabilitationModal)}
      </div>

      {c && this.renderHiddenInput(c, opFunc)}

      <NewOperatorSelection
        opFunc={this.props.opFunc}
        visible={this.state.visible}
        handleCloseClick={this.handleModalToggle}
        changeOperator={this.handleOperatorChange}
      />

      {<HabilitationModal
        onCloseClick={this.handleCloseModal}
        onConfirm={this.handleCloseModal}
        visible={this.state.modal === "habilitation"}
        operator={c}
        opFunc={this.props.opFunc}
        onRefresh={this.props.onHabilitationChange}
      />}
    </div>;
  }
}
SelectContributor.displayName = "SelectContributor";
SelectContributor.propTypes = {
  SelectContributor: PropTypes.object,
  label: PropTypes.string.isRequired,
  fields: PropTypes.array,
  disabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onHabilitationChange: PropTypes.func.isRequired,
  opFunc: PropTypes.string.isRequired,
  legacyReturn: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  contributor: PropTypes.object,
};
SelectContributor.defaultProps = {
  SelectContributor: undefined,
  fields: undefined,
  disabled: false,
  legacyReturn: false,
  readOnly: false,
  required: false,
  contributor: undefined,
};

module.exports = SelectContributor;
