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
const BudgetExpanded = require("./budgetexpand.js");
const BudgetBlock = require("./budgetblock.js");
const BudgetCreationModal = require("./budgetcreationmodal.js");

class BudgetList extends AsyncFilteredList {
  constructor(props) {
    super(props);
    this.s = [
      {key: "date", format: date => date.toISOString()},
      {key: "month"},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "budget/search";
    this.base = "/budget/";
    this.charts = [];

    this.state = {
      ...this.defaultState(),
      ...props.query,
      modal: "",
      currentBudget: null,
    };

    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
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
    const budget = this.props.budget.rows.find(acc => acc.id === budgetId);
    this.setState({currentBudget: budget});
  }

  _renderFilters() {
    return <form className="filters">
      {this._renderFilterWrapper(
        "Année: ",
        <DatePicker
          name="date"
          selected={this.state.date || new Date()}
          autoComplete="off"
          dateFormat="MM/yyyy"
          showMonthYearPicker
          onChangeLegacy={date => this.handleChange(date, "date")}
        />,
      )}
    </form>;
  }

  render() {
    const list = this.props.budget.rows.map(budget => <div
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
      <Columns>
        <div className="column">
          <div className="content operator-scrollblock">
            {list}
          </div>
        </div>
        {expanded}
      </Columns>
      <BudgetCreationModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}
BudgetList.displayName = "BudgetList";
BudgetList.propTypes = {
  user: PropTypes.object.isRequired,
  budget: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
};

module.exports = BudgetList;
