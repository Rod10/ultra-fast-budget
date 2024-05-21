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

class TransactionModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  static newRow(key = 0) {
    return {
      key,
      amount: "",
      categoryId: "",
      subCategoryId: "",
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      transaction: {},
      data: [],
      visible: false,
      alert: false,
      pending: false,
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.transactionFormRef = React.createRef();
  }

  componentDidMount() {
    window.openTransactionModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("transaction", this.openModal);
    }
  }

  openModal(transaction) {
    this.setState(() => {
      const data = transaction.data
        ? addKeyToArray(transaction.data)
        : [TransactionModal.newRow()];
      return {
        transaction,
        visible: true,
        data,
      };
    });
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "key");
    const key = el.dataset.key;
    this.setState({[key]: evt.target.value});
  }

  handleConfirmClick() {
    if (this.state.pending) return;

    if (this.transactionFormRef.current.reportValidity()) {
      this.setState(({pending: true}), () => {
        this.transactionFormRef.current.submit();
      });
    }
  }

  handleClose(evt) {
    this.setState({visible: false});
  }

  handleListChange(evt) {
    preventDefault(evt);
    const el = evt.target;
    const list = el.dataset.list;
    const key = parseInt(el.dataset.key, 10);
    const propName = el.dataset.propname;
    /* this.setState(prevState => ({
      [list]: prevState[list].map(entry => {
        if (entry.key === key) {
          return {[propName]: evt.target.value};
        }
        // return entry;
      }),
    }));*/
  }

  _renderSubTransactionsRow(item, index) {
    return <div key={item.key}>
      <input
        className={"is-hidden"}
        name={`data[${index}][categoryId]`}
        defaultValue={item.categoryId ? item.categoryId : 0}
        readOnly
      />
      <input
        className={"is-hidden"}
        name={`data[${index}][subCategoryId]`}
        defaultValue={item.subCategoryId ? item.subCategoryId : 0}
        readOnly
      />
      <Columns>
        <Column>
          <Input
            className="input"
            label="Montant"
            type="text"
            name="amount"
            value={item.amount}
            data-list="data"
            data-propname="amount"
            data-key={item.key}
            onChange={this.handleListChange}
            horizontal
          />
        </Column>
      </Columns>
    </div>;
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    // if (!this.state.confirm) return null;
    const transaction = this.state.transaction;
    let action = null;
    let title = null;
    if (transaction.id) {
      action = `/transaction/${transaction.id}/edit`;
      title = "Modifier la transaction";
    } else {
      if (transaction.type === TransactionType.INCOME) {
        title = "Créer un revenu";
      } else {
        title = "Créer une dépense";
      }
      action = "/transaction/new";
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
        ref={this.transactionFormRef}
        method="POST"
        action={action}
      >
        <Columns>
          <Column>
            <Title size={4} className="mb-2">{title}</Title>
          </Column>
        </Columns>
        {this.state.data.map((row, index) => this._renderSubTransactionsRow(row, index))}
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
        handleConfirm={TransactionModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}
TransactionModal.displayName = "TransactionModal";
TransactionModal.propTypes = {
  /* visible: PropTypes.bool.isRequired,
  transaction: PropTypes.object,
  onClose: PropTypes.func.isRequired,*/
  onRegisterModal: PropTypes.func.isRequired,
};
// TransactionModal.defaultProps = {transaction: undefined};

module.exports = TransactionModal;
