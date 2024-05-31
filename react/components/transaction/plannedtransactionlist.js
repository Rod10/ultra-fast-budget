const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

// const TransactionType = require("../express/constants/transactiontype.js");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");

// const AccountModal = require("../transactionmodal.js");
const utils = require("../utils.js");
const TransactionBlock = require("./transactionblock.js");
const TransactionExpanded = require("./transactionexpand.js");
// const AccountExpand = require("../transactionexpand.js");

const PlannedTransactionModal = require("./plannedtransactionmodal.js");

class PlannedTransactionList extends React.Component {
  constructor(props) {
    super(props);
    this.base = "/planned-transaction/";
    this.charts = [];
    if (this.props.graphs) {
      this.props.graphs.forEach(graph => {
        this.charts[graph.label] = React.createRef();
      });
    }

    this.state = {currentTransaction: null};

    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
  }

  componentDidMount() {
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(BarController);
    Chart.register(BarElement);
    Chart.register(...registerables);

    if (this.props.graphs) {
      this.props.graphs.forEach(graph => {
        if (graph.type === "pie") {
          this.createPieChart(graph, this.charts[graph.label].current.getContext("2d"));
        } else {
          this.createLineChart(graph, this.charts[graph.label].current.getContext("2d"));
        }
      });
    }
  }

  createPieChart(graph, chart) {
    this.context = chart;
    const {label, labels, backgroundColor} = graph;
    const data = {
      labels,
      datasets: [{
        label,
        data: graph.data,
        backgroundColor,
        hoverOffset: 4,
      }],
    };
    new Chart(this.context.canvas, {
      type: "pie",
      data,
      options: {responsive: true},
    });
  }

  handleRegisterModal(modal, fn) {
    if (modal === "planned-transaction") {
      this.openPlannedTransactionModal = fn;
    }
  }

  handleCloseDetails() {
    this.setState({currentTransaction: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "transactionid");
    const transactionId = parseInt(el.dataset.transactionid, 10);
    const transaction = this.props.transaction.rows.find(acc => acc.id === transactionId);
    this.setState({currentTransaction: transaction});
  }

  render() {
    const list = this.props.transaction.rows.map(transaction => <div
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
        onClick={() => this.openPlannedTransactionModal({type: this.state.currentTransaction.type, transaction: this.state.currentTransaction, categories: this.props.categories, accounts: this.props.accounts.rows})}
      />;

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Mes Transactions plannifiées</Title>
        </Column>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              type="success"
              icon={<Icon size="small" icon="arrow-trend-up" />}
              label="Ajouter un nouveau revenu"
              onClick={() => this.openPlannedTransactionModal({type: "EXPECTED_INCOME", transaction: null, categories: this.props.categories, accounts: this.props.accounts.rows})}
            />
            <Button
              className="has-text-weight-bold mr-3"
              type="danger"
              icon={<Icon size="small" icon="arrow-trend-down" />}
              label="Ajouter une nouvelle dépense"
              onClick={() => this.openPlannedTransactionModal({type: "EXPECTED_EXPENSE", transaction: null, categories: this.props.categories, accounts: this.props.accounts.rows})}
            />
          </div>
        </Column>
      </Columns>

      <Columns>
        <div className="column">
          <div className="content operator-scrollblock">
            {list}
          </div>
        </div>
        {expanded}
      </Columns>
      <PlannedTransactionModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}
PlannedTransactionList.displayName = "PlannedTransactionList";
PlannedTransactionList.propTypes = {
  user: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  graphs: PropTypes.array,
};
PlannedTransactionList.defaultProps = {graphs: undefined};

module.exports = PlannedTransactionList;
