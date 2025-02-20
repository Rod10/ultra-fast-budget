const React = require("react");
const PropTypes = require("prop-types");
const dateFns = require("date-fns");

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
const Notifications = require("../bulma/notifications.js");
const DatePicker = require("../datepicker.js");

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
      id: null,
      categories: {rows: []},
      data: [],
      date: "",
      account: "",
      notes: "",
      to: "",
      dataLastKey: 0,
      currentKey: 0,
      accounts: [],
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
    this.handleDateChange = this.handleDateChange.bind(this);
    this.transactionFormRef = React.createRef();
  }

  componentDidMount() {
    window.openTransactionModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("transaction", this.openModal);
    }
  }

  openModal(items) {
    this.setState(() => {
      const data = items.transaction
        ? addKeyToArray(items.transaction.data)
        : [TransactionModal.newRow()];
      const date = items.transaction ? new Date(items.transaction.transactionDate)
        : new Date();
      const account = items.transaction ? items.transaction.account.toString() : "0";
      const notes = items.transaction ? items.transaction.other : "";
      const to = items.transaction ? items.transaction.to : "";
      const id = items.transaction ? items.transaction.id : 0;
      const unit = items.transaction ? items.transaction.unit : "month";
      const occurence = items.transaction ? items.transaction.occurence : "0";
      const number = items.transaction ? items.transaction.number : "0";
      return {
        id,
        transaction: items.transaction,
        type: items.type,
        visible: true,
        data,
        date,
        account,
        notes,
        to,
        occurence,
        unit,
        number,
        accounts: items.accounts,
        dataLastKey: data.length - 1,
        categories: items.categories,
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

    const missingCategory = this.state.data.find(data => data.category === null);
    const missingCategoryIndex = this.state.data.findIndex(data => data === missingCategory);
    console.log(missingCategory);
    if (this.transactionFormRef.current.reportValidity() && missingCategory === undefined) {
      this.setState(({pending: true}), () => {
        this.transactionFormRef.current.submit();
      });
    } else if (missingCategory !== undefined) {
      Notifications.addNotification("is-danger", `Veuillez renseigner une catégorie pour la ligne ${missingCategoryIndex + 1}.`);
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
            category: category.id,
            subCategory: subCategory.id,
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

  handleDateChange(result) {
    this.setState({date: result.target.value});
  }

  _renderSubTransactionsRow(item, index) {
    const iconButton = item.subCategory ? <img src={`/icon/${item.subCategory.imagePath}`} style={{maxWidth: "15%", marginRight: "1rem"}} />
      : <Icon size="small" icon="magnifying-glass" />;
    const labelButton = item.subCategory ? item.subCategory.name : "Choisir une catégorie";
    return <Columns key={item.key}>
      <input
        className="is-hidden"
        name={`data[${index}][category]`}
        defaultValue={item.category?.id === undefined ? item.category : item.category.id}
        readOnly
      />
      <input
        className="is-hidden"
        name={`data[${index}][subCategory]`}
        defaultValue={item.subCategory?.id === undefined ? item.subCategory : item.subCategory.id}
        readOnly
      />
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
          required
        />
      </Column>
      <Column>
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
    </Columns>;
  }

  _renderData() {
    return <div>
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
    </div>;
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    if (this.state.id === null) return null;
    let action = null;
    let title = null;
    if (this.state.id !== 0) {
      action = `/transaction/${this.state.id}/edit`;
      title = "Modifier la transaction";
    } else {
      if (this.state.type === TransactionType.INCOME) {
        title = "Créer un revenu";
      } else if (this.state.type === TransactionType.EXPENSE) {
        title = "Créer une dépense";
      }
      action = "/transaction/new";
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
        <input
          className="is-hidden"
          name={"type"}
          defaultValue={this.state.type}
          readOnly
        />
        <Columns>
          <Column>
            <Title size={4} className="mb-2">{title}</Title>
          </Column>
        </Columns>
        {this._renderData()}
        <Columns>
          <Column>
            <Select
              label="Compte"
              type="text"
              name="account"
              defaultValue={this.state.account}
              data-propname={"account"}
              onChange={this.handleChange}
              options={accountsOptions}
            />
          </Column>
          <Column>
            <div>
              <div className="field">
                <label className="label">Date de la transaction</label>
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
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              placeholder="A:"
              label="A:"
              type="text"
              name={"to"}
              value={this.state.to}
              data-propname="to"
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Input
              className="input"
              placeholder="Notes"
              label="Notes:"
              type="text"
              name={"notes"}
              value={this.state.notes}
              data-propname="notes"
              onChange={this.handleChange}
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
        genre={this.state.type === "EXPENSE" ? "OUTCOME" : this.state.type}
      />
      <Notifications />
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
