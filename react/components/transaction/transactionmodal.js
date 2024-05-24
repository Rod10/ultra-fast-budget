const React = require("react");
const PropTypes = require("prop-types");

const axios = require("axios");
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

const RateModal = require("./ratemodal.js");
const CategoryModal = require("./categorymodal.js");

class TransactionModal extends React.Component {
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
      transaction: {},
      categories: {rows: []},
      data: [],
      dataLastKey: 0,
      currentKey: 0,
      visible: false,
      alert: false,
      pending: false,
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleOpenCurrenyRateModal = this.handleOpenCurrenyRateModal.bind(this);
    this.handleCurrenyRate = this.handleCurrenyRate.bind(this);
    this.handleRowToData = this.handleRowToData.bind(this);
    this.handleOpenCategoryModal = this.handleOpenCategoryModal.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleRemoveFromList = this.handleRemoveFromList.bind(this);
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
        dataLastKey: data.length - 1,
        categories: transaction.categories,
      };
    });
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "key");
    const key = el.dataset.key;
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

  handleCloseModal() {
    this.setState({modal: null});
  }

  handleListChange(evt) {
    preventDefault(evt);
    const el = evt.target;
    const list = el.dataset.list;
    const key = parseInt(el.dataset.key, 10);
    const propName = el.dataset.propname;
    this.setState(prevState => ({
      [list]: prevState[list].map(entry => {
        if (entry.key === key) {
          return {
            ...entry,
            [propName]: evt.target.value,
          };
        }
        return entry;
      }),
    }));
  }

  handleOpenCurrenyRateModal(evt) {
    preventDefault(evt);
    const el = getElFromDataset(evt, "key");
    const key = parseInt(el.dataset.key, 10);
    this.setState({modal: "rate", currentKey: key});
  }

  handleCurrenyRate(amount, from, to) {
    axios.get("/api/currency-rate", {
      params: {
        amount,
        from,
        to,
      },
    })
      .then(response => {
        this.setState(prevState => ({
          data: prevState["data"].map(entry => {
            if (entry.key === prevState.currentKey) {
              return {
                ...entry,
                amount: response.data.result,
              };
            }
            return entry;
          }),
        }));
      })
      .catch(error => new Error(error));
    this.setState({modal: null});
  }

  handleRowToData(evt) {
    preventDefault(evt);
    this.setState(prevState => ({
      dataLastKey: prevState["dataLastKey"] + 1,
      data: prevState.data.concat(TransactionModal.newRow(prevState["dataLastKey"] + 1)),
    }));
  }

  handleOpenCategoryModal(evt) {
    preventDefault(evt);
    const el = getElFromDataset(evt, "key");
    const key = parseInt(el.dataset.key, 10);
    this.setState({modal: "category", currentKey: key});
  }

  handleCategoryChange(category, subCategory) {
    this.setState(prevState => ({
      data: prevState["data"].map(entry => {
        if (entry.key === prevState.currentKey) {
          return {
            ...entry,
            category,
            subCategory,
          };
        }
        return entry;
      }),
      modal: null,
    }));
  }

  handleRemoveFromList(evt) {
    this.setState(prevState => {
      let el = evt.target;
      while (!el.dataset.btn) {
        el = el.parentNode;
      }
      const key = parseInt(el.dataset.key, 10);
      const entries = prevState["data"].filter(e => e.key !== key);
      if (entries.length) {
        return {data: entries};
      }
      return {
        data: [TransactionModal.newRow()],
        dataLastKey: 0,
      };
    });
  }

  _renderSubTransactionsRow(item, index) {
    const iconButton = item.subCategory ? <img src={`/icon/${item.subCategory.imagePath}`} style={{maxWidth: "15%", marginRight: "1rem"}} />
      : <Icon size="small" icon="magnifying-glass" />;
    const labelButton = item.subCategory ? item.subCategory.name : "Choisir une catégorie";
    return <div key={item.key}>
      <Columns className="is-variable is-1">
        <Column>
          <Input
            className="input"
            placeholder="Montant"
            type="text"
            name={`data[${index}][amount]`}
            value={item.amount}
            data-list="data"
            data-propname="amount"
            data-key={item.key}
            onChange={this.handleListChange}
            horizontal
          />
        </Column>
        <Column className="is-1">
          {<Button
            label={""}
            icon={<Icon
              icon="euro-sign"
              faSize="lg"
              size="big"
            />}
            data-key={item.key}
            onClick={this.handleOpenCurrenyRateModal}
          />}
        </Column>
        <Column>
          <Button
            label={labelButton}
            icon={iconButton}
            data-key={item.key}
            onClick={this.handleOpenCategoryModal}
          />
        </Column>
        <Column>
          <Button
            label={""}
            icon={<Icon
              icon="times"
              faSize="lg"
              size="big"
            />}
            data-key={item.key}
            data-btn="remove"
            onClick={this.handleRemoveFromList}
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
        <hr />
        <Columns>
          <Column offset={Column.Offsets.fourFifths}>
            <Button
              label=""
              icon={<Icon
                icon="plus"
                faSize="lg"
                size="small"
              />}
              data-btn="add"
              data-list="data"
              onClick={this.handleRowToData}
            />
          </Column>
        </Columns>
      </form>
      <RateModal
        visible={this.state.modal === "rate"}
        onConfirm={this.handleCurrenyRate}
        onClose={this.handleCloseModal}
      />
      <CategoryModal
        visible={this.state.modal === "category"}
        onConfirm={this.handleCategoryChange}
        onClose={this.handleCloseModal}
        categories={this.state.categories}
        genre={transaction.type === "EXPENSE" ? "OUTCOME" : transaction.type}
      />
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
