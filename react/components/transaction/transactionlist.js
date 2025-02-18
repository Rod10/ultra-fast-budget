const React = require("react");
const PropTypes = require("prop-types");

// const TransactionType = require("../express/constants/transactiontype.js");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const DatePicker = require("../datepicker.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const AsyncFilteredList = require("./../asyncfilteredlist.js");

const TransactionBlock = require("./transactionblock.js");
const TransactionExpanded = require("./transactionexpand.js");

const TransactionModal = require("./transactionmodal.js");

class TransactionList extends AsyncFilteredList {
  constructor(props) {
    super(props);

    // define properties to search
    this.s = [
      {key: "startingDate", format: date => date.toISOString()},
      {key: "endingDate", format: date => date.toISOString()},
      {key: "account"},
      {key: "genre"},
      {key: "category"},
      {key: "subCategory"},
      {key: "isPlanned"},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "transaction/search";

    this.base = "/transaction/";

    this.state = {
      ...this.defaultState(),
      ...props.query,
      currentTransaction: null,
      rows: this.props.transactions.rows,
    };

    this.handleOpenAccountModal = this.handleOpenAccountModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "transaction") {
      this.openTransactionModal = fn;
    }
  }

  handleOpenAccountModal() {
    this.setState({modal: "transaction"});
  }

  handleCloseModal() {
    this.setState({modal: null});
  }

  handleCloseDetails() {
    this.setState({currentTransaction: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "transactionid");
    const transactionId = parseInt(el.dataset.transactionid, 10);
    const transaction = this.state.rows.find(acc => acc.id === transactionId);
    this.setState({currentTransaction: transaction});
  }

  _renderFilters() {
    const category = this.state.category ? this.props.categories.rows
      .filter(e => this.state.category !== "" && parseInt(this.state.category, 10) === e.id)
    : null;
    return <form className="filters">
      {this._renderFilterWrapper(
        "Du: ",
        <DatePicker
          name="startingDate"
          selected={this.state.startingDate}
          autoComplete="off"
          onChangeLegacy={date => this.handleChange(date, "startingDate")}
        />,
      )}
      {this._renderFilterWrapper(
        "Au: ",
        <DatePicker
          name="endingDate"
          selected={this.state.endingDate}
          autoComplete="off"
          onChangeLegacy={date => this.handleChange(date, "endingDate")}
        />,
      )}
      {this._renderFilterSelect(
        "account",
        "Compte:",
        this.props.accounts.rows
          .map(e => ({value: e.id, label: e.name})),
      )}
      {this._renderFilterSelect(
        "genre",
        "Type:",
        [
          {
            value: "EXPENSE",
            label: "Dépense",
          },
          {
            value: "INCOME",
            label: "Revenue",
          },
        ],
      )}
      {this._renderFilterSelect(
        "isPlanned",
        "Planifiée:",
        [
          {
            value: 1,
            label: "Oui",
          },
          {
            value: "null",
            label: "Non",
          },
        ],
      )}
      {this._renderFilterSelect(
        "category",
        "Catégorie:",
        this.props.categories.rows
          .map(e => ({value: e.id, label: e.name})),
      )}
      {category !== null && this._renderFilterSelect(
        "subCategory",
        "Sous-Catégorie:",
        category[0].subCategories
          .map(e => ({value: e.id, label: e.name})),
      )}
    </form>;
  }

  render() {
    const list = this.state.rows.map(transaction => <div
      className="mb-2"
      data-transactionid={transaction.id}
      onClick={this.handleOpenDetails}
      key={transaction.id}
    >
      <TransactionBlock
        base={this.base}
        user={this.props.user}
        key={transaction.id}
        transaction={transaction}
        expanded={this.state.currentTransaction !== null}
      />
    </div>);

    const expanded = this.state.currentTransaction !== null
        && <TransactionExpanded
          base={this.base}
          key={this.state.currentTransaction.id}
          transaction={this.state.currentTransaction}
          onClose={this.handleCloseDetails}
          user={this.props.user}
          onClick={() => this.openTransactionModal({type: this.state.currentTransaction.type, transaction: this.state.currentTransaction, categories: this.props.categories, accounts: this.props.accounts.rows})}
        />;

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Mes Transactions</Title>
        </Column>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              type="success"
              icon={<Icon size="small" icon="arrow-trend-up" />}
              label="Ajouter un nouveau revenu"
              onClick={() => this.openTransactionModal({
                type: "INCOME",
                transaction: null,
                categories: this.props.categories,
                accounts: this.props.accounts.rows,
              })}
            />
            <Button
              className="has-text-weight-bold mr-3"
              type="danger"
              icon={<Icon size="small" icon="arrow-trend-down" />}
              label="Ajouter une nouvelle dépense"
              onClick={() => this.openTransactionModal({
                type: "EXPENSE",
                transaction: null,
                categories: this.props.categories,
                accounts: this.props.accounts.rows,
              })}
            />
          </div>
        </Column>
      </Columns>
      {this._renderFilters()}
      <hr />
      <Columns>
        <div className="column">
          <div className="content operator-scrollblock">
            {list}
          </div>
        </div>
        {expanded}
      </Columns>
      <TransactionModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}

TransactionList.displayName = "TransactionList";
TransactionList.propTypes = {
  user: PropTypes.object.isRequired,
  transactions: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  graphs: PropTypes.array,
};
TransactionList.defaultProps = {graphs: undefined};

module.exports = TransactionList;
