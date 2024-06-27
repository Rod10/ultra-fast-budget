const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Modal = require("../modal.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Input = require("../bulma/input.js");
const Select = require("../bulma/select.js");
const Title = require("../bulma/title.js");

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
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.accountFormRef = React.createRef();
  }

  componentDidMount() {
    window.openAccountTypeModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("account-type", this.openModal);
    }
  }

  openModal(account) {
    this.setState(() => ({
      visible: true,
      account,
      name: account ? account.name : "",
      type: account ? account.type : "",
      color: account ? account.color : "",
      className: account ? account.className : "",
      interest: account ? account.interest : "",
      maxAmount: account ? account.maxAmount : "",
      unit: account ? account.unit : "year",
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
      action = `/settings/account-type/${account.id}/edit`;
      title = "Modifier le type de compte";
    } else {
      action = "/settings/account-type/new";
      title = "Créer un type de compte";
    }

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
            <Input
              className="input"
              label="Couleur (graphique)"
              type="text"
              name="color"
              value={this.state.color}
              data-key={"color"}
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Input
              className="input"
              label="ClassName (tag)"
              type="text"
              name="className"
              value={this.state.className}
              data-key={"className"}
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              label="Interêt"
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
              label="Montant Maximal du compte (0 pour infini)"
              type="text"
              name="maxAmount"
              value={this.state.maxAmount}
              data-key={"maxAmount"}
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        <Columns>
          <Column><Select
            label="Périodicité"
            type="text"
            name="unit"
            defaultValue={this.state.unit}
            data-propname={"unit"}
            onChange={this.handleChange}
            options={[
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
            ]}
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
