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
      currency: "EUR",
      alert: false,
      pending: false,
    };
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleConfirmClick() {
    return this.props.onConfirm(this.state.amount, this.state.currency);
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
    const currenciesOptions = Object.keys(Currencies).map(currency => ({
      value: currency,
      label: CurrenciesFull[currency].name,
    }));
    return <Modal
      visible={this.props.visible}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText="Créer"
      onClose={this.handleClose}
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
          <Select
            label="Devise"
            type="text"
            name="currency"
            defaultValue={this.state.currency}
            data-propname={"currency"}
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
};
// RateModal.defaultProps = {transaction: undefined};

module.exports = RateModal;
