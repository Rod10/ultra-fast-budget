const React = require("react");
const PropTypes = require("prop-types");

// const TransactionType = require("../express/constants/budgettype.js");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const DatePicker = require("../datepicker.js");

// const AccountModal = require("../budgetmodal.js");
const utils = require("../utils.js");
const AsyncFilteredList = require("../asyncfilteredlist.js");
const TransactionModalList = require("../transactionmodallist.js");
const BudgetExpanded = require("./budgetexpand.js");
const BudgetBlock = require("./budgetblock.js");
const BudgetCreationModal = require("./budgetcreationmodal.js");

class BudgetList extends AsyncFilteredList {
  constructor(props) {
    super(props);
    this.s = [
      {key: "period"},
      {key: "date", format: date => date.toISOString()},
      {key: "startingDate", format: date => date.toISOString()},
      {key: "endingDate", format: date => date.toISOString()},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "budget/search";
    this.base = "/budget/";
    this.charts = [];

    this.state = {
      ...this.defaultState(),
      ...props.query,
      rows: props.budgets.rows,
      dataPerMonth: props.transactionNotInBudget,
      category: "",
      period: "now",
      modal: "",
      currentBudget: null,
    };

    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
    this.handleOpenTransactionsModal = this.handleOpenTransactionsModal.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "budget-creation") {
      this.openBudgetCreationModal = fn;
    }
  }

  handleCloseDetails() {
    this.setState({currentBudget: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "budgetid");
    const budgetId = parseInt(el.dataset.budgetid, 10);
    const budget = this.state.rows.find(acc => acc.id === budgetId);
    this.setState({currentBudget: budget});
  }

  handleOpenTransactionsModal(evt) {
    this.setState(prevState => ({modal: prevState.modal === "details" ? null : "details"}));
  }

  handleCloseClick() {
    this.setState({modal: null});
  }

  // eslint-disable-next-line max-lines-per-function
  _renderFilters() {
    const totalAmount = this.state.rows.reduce((acc, row) => acc + row.totalAmount, 0);
    const totalAllocatedAmount = this.state.rows.reduce((acc, row) => acc + row.totalAllocatedAmount, 0);
    let totalOutOfBudget = 0;
    for (const data of this.state.dataPerMonth) {
      if (data.length > 0) {
        for (const transactionData of data) {
          totalOutOfBudget += transactionData.data.reduce((acc, row) => acc + parseFloat(row.amount), 0);
        }
      }
    }
    return <form className="filters">
      {this._renderFilterSelect(
        "period",
        "Période:",
        [
          {
            value: "now",
            label: "Ce mois-ci",
          },
          {
            value: "last",
            label: "Dernier mois",
          },
          {
            value: "between",
            label: "Entre",
          },
          {
            value: "exact",
            label: "Préciser un mois",
          },
        ],
      )}
      {this.state.period === "exact" && this._renderFilterWrapper(
        "Mois/Année: ",
        <DatePicker
          name="date"
          selected={this.state.date}
          autoComplete="off"
          dateFormat="MM/yyyy"
          showMonthYearPicker
          onChangeLegacy={date => this.handleChange(date, "date")}
        />,
      )}
      {this.state.period === "between" && this._renderFilterWrapper(
        "Date de début: ",
        <DatePicker
          name="startingDate"
          selected={this.state.startingDate}
          autoComplete="off"
          dateFormat="MM/yyyy"
          showMonthYearPicker
          onChangeLegacy={date => this.handleChange(date, "startingDate")}
        />,
      )}
      {this.state.period === "between" && this._renderFilterWrapper(
        "Date de fin: ",
        <DatePicker
          name="endingDate"
          selected={this.state.endingDate}
          autoComplete="off"
          dateFormat="MM/yyyy"
          showMonthYearPicker
          onChangeLegacy={date => this.handleChange(date, "endingDate")}
        />,
      )}
      {this.state.period === "now" && <div className="field">
        <label className="label">Total dépensé/Total alloué:</label>
        <b><span className={`has-text-${totalAmount >= totalAllocatedAmount
          ? "danger"
          : "success"}`}
        >{totalAmount}</span>/<span className="has-text-danger">{totalAllocatedAmount} €</span>
        </b>
      </div>}
      {this.state.period === "now" && <div className="field">
        <label className="label">Budget total restant:</label>
        <b><span className={`has-text-${totalAllocatedAmount - totalAmount - totalOutOfBudget <= 0
          ? "danger"
          : "success"}`}
        >{totalAllocatedAmount - totalAmount - totalOutOfBudget} €</span>
        </b>
      </div>}
      <div className="field">
        <label className="label">Dépense hors budget: {totalOutOfBudget} €</label>
        <span><a
          className="button has-text-weight-bold mr-3 is-link is-themed"
          onClick={this.handleOpenTransactionsModal}
        >Détails</a></span>
      </div>
    </form>;
  }

  render() {
    const list = this.state.rows.map(budget => <div
      className="mb-2"
      data-budgetid={budget.id}
      onClick={this.handleOpenDetails}
      key={budget.id}
    >
      <BudgetBlock
        base={this.base}
        user={this.props.user}
        key={budget.id}
        budget={budget}
        expanded={this.state.currentBudget !== null}
      />
    </div>);

    const expanded = this.state.currentBudget !== null
     && <BudgetExpanded
       base={this.base}
       key={this.state.currentBudget.id}
       budget={this.state.currentBudget}
       onClose={this.handleCloseDetails}
       user={this.props.user}
       onClick={() => this.openBudgetCreationModal({budget: this.state.currentBudget, categories: this.props.categories})}
     />;

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Mes Budgets</Title>
        </Column>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              type="info"
              icon={<Icon size="small" icon="calculator" />}
              label="Créer un nouveau budget"
              onClick={() => this.openBudgetCreationModal({budget: null, categories: this.props.categories})}
            />
            <Button
              className="has-text-weight-bold mr-3"
              type="themed"
              icon={<Icon size="small" icon="rotate" />}
              label="Recalculer les budgets"
              href="/budget/rebalance-all"
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
      <BudgetCreationModal onRegisterModal={this.handleRegisterModal} />
      <TransactionModalList
        visible={this.state.modal === "details"}
        month={"Détails"}
        onCloseClick={this.handleCloseClick}
        account={this.props.account}
        dataPerMonth={this.state.dataPerMonth}
      />
    </div>;
  }
}

BudgetList.displayName = "BudgetList";
BudgetList.propTypes = {
  user: PropTypes.object.isRequired,
  rows: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
};

module.exports = BudgetList;
