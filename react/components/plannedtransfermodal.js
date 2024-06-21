const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset, preventDefault} = require("../utils/html.js");
const Modal = require("./modal.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Input = require("./bulma/input.js");
const Select = require("./bulma/select.js");
const Title = require("./bulma/title.js");
const DatePicker = require("./datepicker.js");

class PlannedTransferModal extends React.Component {
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
      id: null,
      amount: null,
      date: new Date(),
      accounts: null,
      visible: false,
      alert: false,
      pending: false,
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.transactionFormRef = React.createRef();
  }

  componentDidMount() {
    window.openPlannedTransferModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("planned-transfer", this.openModal);
    }
  }

  openModal(items) {
    this.setState(() => {
      const id = items.plannedTransfer ? items.plannedTransfer.id : 0;
      const amount = items.plannedTransfer ? items.plannedTransfer.amount : 0;
      const other = items.plannedTransfer ? items.plannedTransfer.other : 0;
      const date = items.plannedTransfer ? new Date(items.plannedTransfer.transferDate)
        : new Date();
      const occurence = items.plannedTransfer ? items.plannedTransfer.other : 0;
      const unit = items.plannedTransfer ? items.plannedTransfer.other : "month";
      const number = items.plannedTransfer ? items.plannedTransfer.other : 0;
      return {
        id,
        amount,
        other,
        date,
        occurence,
        unit,
        number,
        accounts: items.accounts.rows,
        visible: true,
      };
    });
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "propname");
    const key = el.dataset.propname;
    this.setState({[key]: evt.target.value});
  }

  handleConfirmClick(evt) {
    preventDefault(evt);
    if (this.state.pending) return;

    if (this.transactionFormRef.current.reportValidity()) {
      this.setState(({pending: true}), () => {
        this.transactionFormRef.current.submit();
      });
    }
  }

  handleClose() {
    this.setState({visible: false});
  }

  handleDateChange(result) {
    this.setState({date: result.target.value});
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    if (this.state.id === null) return null;
    let action = null;
    let title = null;
    if (this.state.id !== 0) {
      action = `/planned-transfer/${this.state.id}/edit`;
      title = "Modifier le virement planifié";
    } else {
      title = "Créer un virement planifié";
      action = "/planned-transfer/new";
    }

    // TODO: replace € with actual account currency
    const accountsOptions = this.state.accounts.map(account => ({
      value: parseInt(account.id, 10),
      label: `${account.name}: ${account.balance} €`,
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
        ref={this.transactionFormRef}
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
            <Select
              label="De:"
              type="text"
              name="sender"
              defaultValue={this.state.sender}
              data-propname={"sender"}
              onChange={this.handleChange}
              options={accountsOptions}
            />
          </Column>
          <Column>
            <Select
              label="A:"
              type="text"
              name="receiver"
              defaultValue={this.state.receiver}
              data-propname={"receiver"}
              onChange={this.handleChange}
              options={accountsOptions}
            />
          </Column>
          <Column>
            <Input
              className="input"
              placeholder="Montant:"
              label="Montant:"
              type="text"
              name={"amount"}
              value={this.state.amount}
              data-propname="amount"
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <div>
              <div className="field">
                <label className="label">Date du virement</label>
                <DatePicker
                  name="date"
                  required
                  selected={this.state.date}
                  showTimeSelect
                  onChange={this.handleDateChange}
                />
              </div>
            </div>
          </Column>
          <Column>
            <Input
              className="input"
              placeholder="Notes"
              label="Notes:"
              type="text"
              name={"other"}
              value={this.state.other}
              data-propname="other"
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              placeholder="Occurence"
              label="Occurence:"
              type="text"
              name={"occurence"}
              value={this.state.occurence}
              data-propname="occurence"
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Select
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
        <Columns>
          <Column>
            <Input
              className="input"
              placeholder="Nombre de fois"
              label="Nombre de fois (0 est égal à infinie):"
              type="text"
              name={"number"}
              value={this.state.number}
              data-propname="number"
              onChange={this.handleChange}
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
        handleConfirm={PlannedTransferModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}
PlannedTransferModal.displayName = "PlannedTransferModal";
PlannedTransferModal.propTypes = {onRegisterModal: PropTypes.func.isRequired};

module.exports = PlannedTransferModal;
