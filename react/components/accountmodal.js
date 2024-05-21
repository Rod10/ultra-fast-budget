const React = require("react");
const PropTypes = require("prop-types");

const AccountType = require("../../express/constants/accountstype.js");
const AccountTypeFull = require("../../express/constants/accountstypefull.js");
const Currencies = require("../../express/constants/currencies.js");
const CurrenciesFull = require("../../express/constants/currenciesfull.js");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Modal = require("./modal.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Icon = require("./bulma/icon.js");
const Input = require("./bulma/input.js");
const Select = require("./bulma/select.js");
const Title = require("./bulma/title.js");

class AccountModal extends React.Component {
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
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.accountFormRef = React.createRef();
  }

  componentDidMount() {
    window.openAccountModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("account", this.openModal);
    }
  }

  openModal(account) {
    this.setState(() => ({
      visible: true,
      account,
      name: account ? account.name : "",
      type: account ? account.type : "",
      initialBalance: account ? account.initialBalance : "",
      currency: account ? account.currency : "",
    }));
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "key");
    const key = el.dataset.key;
    this.setState({[key]: evt.target.value});
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

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    // if (!this.state.confirm) return null;
    const account = this.state.account;
    let action = null;
    let title = null;
    if (account) {
      action = `/account/${account.id}/edit`;
      title = "Modifier votre compte";
    } else {
      action = "/account/new";
      title = "Créer un compte";
    }

    const typeOptions = Object.keys(AccountType).map(currency => ({
      value: currency,
      label: AccountTypeFull[currency].label,
    }));

    const currenciesOptions = Object.keys(Currencies).map(currency => ({
      value: currency,
      label: CurrenciesFull[currency].name,
    }));

    return <Modal
      visible={this.state.visible}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText="Créer"
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
              horizontal
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Select
              label="Type"
              type="text"
              name="type"
              value={this.state.type}
              data-key={"type"}
              options={typeOptions}
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              label="Montant initial"
              type="text"
              name="initialBalance"
              defaultValue={this.state.initialBalance}
              horizontal
            />
          </Column>
        </Columns>
        {this.state.type && <p>Montant Maximal: {AccountTypeFull[this.state.type].maxAmount}</p>}
        <Columns>
          <Column>
            <Select
              label="Devise"
              type="text"
              name="currency"
              defaultValue={this.state.currency}
              options={currenciesOptions}
            />
          </Column>
        </Columns>
      </form>
    </Modal>;
  }

  render() {
    return <div>
      {this._renderConfirm()}
      <Modal
        visible={this.state.alert}
        type="alert"
        confirmText="Recharger la page"
        handleConfirm={AccountModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}
AccountModal.displayName = "AccountModal";
AccountModal.propTypes = {
  /* visible: PropTypes.bool.isRequired,
  account: PropTypes.object,
  onClose: PropTypes.func.isRequired,*/
  onRegisterModal: PropTypes.func.isRequired,
};
// AccountModal.defaultProps = {account: undefined};

module.exports = AccountModal;
