const React = require("react");
const PropTypes = require("prop-types");

const TransactionType = require("../../../express/constants/transactiontype.js");

const {getElFromDataset, preventDefault} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Modal = require("../modal.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Input = require("../bulma/input.js");
const Select = require("../bulma/select.js");
const Title = require("../bulma/title.js");

const {addKeyToArray} = require("../utils.js");
const Currencies = require("../../../express/constants/currencies.js");
const CurrenciesFull = require("../../../express/constants/currenciesfull.js");

class RateModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  static newRow(key = 0) {
    return {
      key,
      amount: "",
      category: null,
      subCategory: null,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      from: "USD",
      to: "EUR",
      alert: false,
      pending: false,
    };
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleConfirmClick(evt) {
    preventDefault(evt);
    return this.props.onConfirm(this.state.amount, this.state.from, this.state.to);
  }

  handleClose(evt) {
    this.setState({visible: false});
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "propname");
    const propname = el.dataset.propname;
    this.setState({[propname]: evt.target.value});
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    const currenciesOptions = Object.keys(Currencies).map(from => ({
      value: from,
      label: CurrenciesFull[from].name,
    }));
    return <Modal
      visible={this.props.visible}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText="Convertir"
      onClose={this.props.onClose}
      onConfirm={this.handleConfirmClick}
      iconType="is-info"
    >
      <Columns>
        <Column>
          <Input
            className="input"
            placeholder="Montant"
            type="text"
            name={"amount"}
            data-propname={"amount"}
            defaultValue={this.state.amount}
            onChange={this.handleChange}
            horizontal
          />
        </Column>
      </Columns>
      <Columns>
        <Column>
          <Select
            label="Devise"
            type="text"
            name="from"
            defaultValue={this.state.from}
            data-propname={"from"}
            onChange={this.handleChange}
            options={currenciesOptions}
          />
        </Column>
        <Column>
          <div className="field">
            <span className="icon is-small">
              <i className="fa fa-arrow-right" />
            </span>
          </div>
        </Column>
        <Column>
          <Select
            label="Devise"
            type="text"
            name="to"
            defaultValue={this.state.to}
            data-propname={"to"}
            onChange={this.handleChange}
            options={currenciesOptions}
          />
        </Column>
      </Columns>
    </Modal>;
  }

  render() {
    return <div>
      {this._renderConfirm()}
      <Modal
        visible={this.state.alert}
        type="alert"
        confirmText="Recharger la page"
        handleConfirm={RateModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}
RateModal.displayName = "RateModal";
RateModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
// RateModal.defaultProps = {transaction: undefined};

module.exports = RateModal;
