const React = require("react");
const reactCSS = require("reactcss").default;
const PropTypes = require("prop-types");
const Select = require("react-select").default;
const {ChromePicker, SketchPicker} = require("react-color");

const {ValueContainer, Placeholder} = require("react-select").components;

const {Tooltip} = require("react-tooltip");
const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Modal = require("../modal.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Input = require("../bulma/input.js");
// const Select = require("../bulma/select.js");
const Title = require("../bulma/title.js");

const TagOptions = [
  {
    value: "is-white",
    label: <p><span className="tag is-white is-normal is-rounded">Blanc</span></p>,
  },
  {
    value: "is-black",
    label: <p><span className="tag is-black is-normal is-rounded">Noire</span></p>,
  },
  {
    value: "is-light",
    label: <p><span className="tag is-light is-normal is-rounded">Gris Clair</span></p>,
  },
  {
    value: "is-dark",
    label: <p><span className="tag is-dark is-normal is-rounded">Gris Foncé</span></p>,
  },
  {
    value: "is-primary",
    label: <p><span className="tag is-primary is-normal is-rounded">Vert (1)</span></p>,
  },
  {
    value: "is-primary is-light",
    label: <p><span className="tag is-primary is-light is-normal is-rounded">Vert Clair (1)</span></p>,
  },
  {
    value: "is-link",
    label: <p><span className="tag is-link is-normal is-rounded">Bleu (1)</span></p>,
  },
  {
    value: "is-link is-light",
    label: <p><span className="tag is-link is-light is-normal is-rounded">Bleu Clair (1)</span></p>,
  },
  {
    value: "is-info",
    label: <p><span className="tag is-info is-normal is-rounded">Bleu (2)</span></p>,
  },
  {
    value: "is-info is-light",
    label: <p><span className="tag is-info is-light is-normal is-rounded">Bleu Clair (2)</span></p>,
  },
  {
    value: "is-success",
    label: <p><span className="tag is-success is-normal is-rounded">Vert (2)</span></p>,
  },
  {
    value: "is-success is-light",
    label: <p><span className="tag is-success is-light is-normal is-rounded">Vert Clair (2)</span></p>,
  },
  {
    value: "is-warning",
    label: <p><span className="tag is-warning is-normal is-rounded">Orange</span></p>,
  },
  {
    value: "is-warning is-light",
    label: <p><span className="tag is-warning is-light is-normal is-rounded">Orange Clair</span></p>,
  },
  {
    value: "is-danger",
    label: <p><span className="tag is-danger is-normal is-rounded">Rouge</span></p>,
  },
  {
    value: "is-danger is-light",
    label: <p><span className="tag is-danger is-light is-normal is-rounded">Rouge Clair</span></p>,
  },
  {
    value: "is-interest",
    label: <p><span className="tag is-danger is-interest is-normal is-rounded">Vert (3)</span></p>,
  },
];

const UnitsOptions = [
  {
    value: "year",
    label: "Annuel",
  },
  {
    value: "month",
    label: "Mensuel",
  },
  {
    value: "week",
    label: "Hebdomadaire",
  },
  {
    value: "day",
    label: "Quotidien",
  },
];

const hexToRGB = hexValue => {
  const numericValue = parseInt(hexValue.slice(1), 16);
  const r = numericValue >> 16 & 0xFF;
  const g = numericValue >> 8 & 0xFF;
  const b = numericValue & 0xFF;
  return {r, g, b};
};

class AccountTypeModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  constructor(props) {
    super(props);

    this.state = {
      account: {},
      name: "",
      type: "",
      currency: "",
      initialBalance: 0,
      visible: false,
      alert: false,
      pending: false,
      displayColorPicker: false,
      color: {
        hex: "#333",
        rgb: {
          r: 51,
          g: 51,
          b: 51,
          a: 1,
        },
        hsl: {
          h: 0,
          s: 0,
          l: 0.20,
          a: 1,
        },
      },
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.handleUnitChange = this.handleUnitChange.bind(this);
    this.handleOpenColorPicker = this.handleOpenColorPicker.bind(this);
    this.handleCloseColorPicker = this.handleCloseColorPicker.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.accountFormRef = React.createRef();
  }

  componentDidMount() {
    window.openAccountTypeModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("account-type", this.openModal);
    }
  }

  openModal(account) {
    this.setState(() => {
      const tagIndex = account
        ? TagOptions.findIndex(tag => tag.value === account.tag)
        : 0;
      const unitIndex = account
        ? UnitsOptions.findIndex(unit => unit.value.toUpperCase() === account.unit)
        : 0;
      const accountColor = hexToRGB(account ? account.color : "#333");
      return {
        visible: true,
        account,
        name: account ? account.name : "",
        type: account ? account.type : "",
        color: {
          hex: account ? account.color : "#333",
          rgb: {
            r: accountColor.r,
            g: accountColor.g,
            b: accountColor.b,
            a: 1,
          },
          hsl: {
            h: 0,
            s: 0,
            l: 0.20,
            a: 1,
          },
        },
        tag: TagOptions[tagIndex],
        interest: account ? account.interest : "",
        maxAmount: account ? account.maxAmount : "",
        unit: UnitsOptions[unitIndex],
      };
    });
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "key");
    const key = el.dataset.key;
    this.setState({[key]: evt.target.value});
  }

  handleColorChange(color) {
    this.setState({color});
  }

  handleConfirmClick() {
    if (this.state.pending) return;

    if (this.accountFormRef.current.reportValidity()) {
      this.setState(({pending: true}), () => {
        this.accountFormRef.current.submit();
      });
    }
  }

  handleClose(evt) {
    this.setState({visible: false});
  }

  handleTagChange(value) {
    this.setState({tag: value});
  }

  handleUnitChange(value) {
    this.setState({unit: value});
  }

  handleOpenColorPicker(evt) {
    this.setState({displayColorPicker: true});
  }

  handleCloseColorPicker(evt) {
    this.setState({displayColorPicker: false});
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    // if (!this.state.confirm) return null;
    const account = this.state.account;
    let action = null;
    let title = null;
    if (account) {
      action = `/settings/preferences/account-type/${account.id}/edit`;
      title = "Modifier le type de compte";
    } else {
      action = "/settings/preferences/account-type/new";
      title = "Créer un type de compte";
    }

    const popover = {
      position: "absolute",
      zIndex: "2",
    };
    const cover = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    };

    const styles = reactCSS({
      "default": {
        color: {
          // width: "36px",
          // height: "14px",
          // borderRadius: "2px",
          background: `rgba(${this.state.color.rgb.r}, ${this.state.color.rgb.g}, ${this.state.color.rgb.b}, ${this.state.color.rgb.a})`,
        },
        swatch: {
          padding: "5px",
          background: "#fff",
          borderRadius: "1px",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
          display: "inline-block",
          cursor: "pointer",
        },
        popover: {
          // position: "absolute",
          zIndex: "2",
        },
        cover: {
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px",
        },
      },
    });

    return <Modal
      visible={this.state.visible}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText={account ? "Modifier" : "Créer"}
      onClose={this.handleClose}
      onConfirm={this.handleConfirmClick}
      iconType="is-info"
    >
      <form
        ref={this.accountFormRef}
        method="POST"
        action={action}
      >
        <Columns>
          <Column>
            <Title size={4} className="mb-2">{title}</Title>
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              label="Nom"
              type="text"
              name="name"
              value={this.state.name}
              data-key={"name"}
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Input
              className="input"
              label="Type"
              type="text"
              name="type"
              value={this.state.type}
              data-key={"type"}
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            {<Input
              className="input"
              style={styles.color}
              label={<span>Couleur <a className="anchor-color">?</a></span>}
              type="text"
              name="color"
              value={this.state.color.hex}
              data-key={"color"}
              onClick={this.handleOpenColorPicker}
            />}
            {/* this.state.displayColorPicker ? <div style={styles.popover}>
              <div style={styles.cover} onClick={this.handleOpenColorPicker} />
              <ChromePicker onChange={this.handleColorChange} />
            </div> : null */}
            {/* <div style={styles.swatch} onClick={this.handleOpenColorPicker}>
              <div style={styles.color} />
            </div> */}
            { this.state.displayColorPicker ? <div style={styles.popover}>
              <div style={styles.cover} onClick={this.handleCloseColorPicker} />
              <SketchPicker color={this.state.color} onChange={this.handleColorChange} />
            </div> : null }
          </Column>
          <Column>
            <div className="field">
              <label className="label">Tag</label>
              <div className="control">
                <Select
                  name="tag"
                  value={this.state.tag}
                  options={TagOptions}
                  onChange={this.handleTagChange}
                  isClearable
                />
              </div>
            </div>
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              label="% Interêt"
              type="text"
              name="interest"
              value={this.state.interest}
              data-key={"interest"}
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Input
              className="input"
              label={<span>Montant maximal du compte <a className="anchor-amount">?</a></span>}
              name="maxAmount"
              value={this.state.maxAmount}
              data-key={"maxAmount"}
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        {this.state.interest > 0 && <Columns>
          <Column>
            <div className="field">
              <label className="label"><span>Périodicité <a className="anchor-interest">?</a></span></label>
              <div className="control">
                <Select
                  name="unit"
                  value={this.state.unit}
                  onChange={this.handleUnitChange}
                  options={UnitsOptions}
                  isClearable
                />
              </div>
            </div>
          </Column>
        </Columns>}
      </form>
      <Tooltip anchorSelect=".anchor-color" place="top">
        La couleur à laquelle vous voulez que les donnée de ce type de compte apparaisse dans les graphiques
      </Tooltip>
      <Tooltip anchorSelect=".anchor-amount" place="top">
        0 pour illimité
      </Tooltip>
      <Tooltip anchorSelect=".anchor-interest" place="top">
        A laquelle les interêts sont verser sur le compte
      </Tooltip>
    </Modal>;
  }

  render() {
    return <div>
      {this._renderConfirm()}
      <Modal
        visible={this.state.alert}
        type="alert"
        confirmText="Recharger la page"
        handleConfirm={AccountTypeModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}
AccountTypeModal.displayName = "AccountTypeModal";
AccountTypeModal.propTypes = {onRegisterModal: PropTypes.func.isRequired};

module.exports = AccountTypeModal;
