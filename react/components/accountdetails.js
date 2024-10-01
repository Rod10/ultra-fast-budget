const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const TransactionModalList = require("./transactionmodallist.js");
const moment = require("moment");

class AccountDetails extends React.Component {
  static splitArrayIntoChunks(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  constructor(props) {
    super(props);

    this.charts = [];
    if (this.props.graphs) {
      this.props.graphs.forEach(graph => {
        this.charts[graph.label] = React.createRef();
      });
    }

    this.state = {
      modal: false,
      selectedRow: 0,
      monthSelectedIndex: 0,
      monthSelectedName: "",
      transactionsByMonth: AccountDetails.splitArrayIntoChunks(this.props.transactionsByMonth, 4),
    };

    this.handleOpenTransactionsModal = this.handleOpenTransactionsModal.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
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
        labels,
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

  createLineChart(graph, chart) {
    this.context = chart;
    const {type, data, options} = graph;
    new Chart(this.context.canvas, {
      type,
      data,
      options,
    });
  }

  handleOpenTransactionsModal(evt) {
    const el = getElFromDataset(evt, "month");
    const monthSelectedIndex = el.dataset.month;
    const monthSelectedName = el.dataset.monthname;
    const selectedRow = el.dataset.row;
    this.setState(prevState => ({
      modal: !prevState.modal,
      monthSelectedIndex,
      selectedRow,
      monthSelectedName,
    }));
  }

  handleCloseClick() {
    this.setState({modal: false});
  }

  _renderGraph(graph, row, index) {
    const color = graph.label[2] > 0 ? "has-text-success" : "has-text-danger";
    return <Column size={Column.Sizes.oneQuarter}>
      <div
        data-row={row}
        data-month={index}
        data-monthname={graph.label[0]}
        className="is-flex graph-container is-clickable"
        onClick={this.handleOpenTransactionsModal}
      >
        <div key={graph.label} className={`is-${graph.column} is-flex-grow-${graph.column}`}>
          <div className="pr-2 pb-2">
            <div className={"graph-box"}>
              <Title size={5}>{graph.label[0]}<br />
                Solde du compte: {graph.label[1]} €<br />
                Variation mensuel: <span className={color}>{graph.label[2]} €</span>
              </Title>
              <div className="is-relative">
                <canvas id="chart" ref={this.charts[graph.label]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Column>;
  }

  render() {
    const graphs = AccountDetails.splitArrayIntoChunks(this.props.graphs, 4);

    return <div className="body-content">
      <Column className="has-text-centered">
        <Title size={5}>Détails du compte: {this.props.account.name}</Title>
        <h5>Année en cour: {new moment().year()}</h5>
      </Column>
      <Columns>
        {graphs[0].length > 0
          && graphs[0].map((col, i) => this._renderGraph(col, 0, i))}
      </Columns>
      <Columns>
        {graphs[1]
          && graphs[1].length > 0
          && graphs[1].map((col, i) => this._renderGraph(col, 1, i))}
      </Columns>
      <Columns>
        {graphs[2]
          && graphs[2].length > 0
          && graphs[2].map((col, i) => this._renderGraph(col, 2, i))}
      </Columns>
      <TransactionModalList
        visible={this.state.modal}
        transactions={this.props.transactionsByMonthAndDays[this.state.monthSelectedIndex]}
        transfers={this.props.transfersByMonthAndDays[this.state.monthSelectedIndex]}
        month={this.state.monthSelectedName}
        onCloseClick={this.handleCloseClick}
        account={this.props.account}
      />
    </div>;
  }
}
AccountDetails.displayName = "AccountDetails";
AccountDetails.propTypes = {
  graphs: PropTypes.array,
  account: PropTypes.object.isRequired,
  transactionsByMonth: PropTypes.array.isRequired,
  transactionsByMonthAndDays: PropTypes.array.isRequired,
  transfersByMonth: PropTypes.array.isRequired,
  transfersByMonthAndDays: PropTypes.array.isRequired,
};
AccountDetails.defaultProps = {graphs: undefined};

module.exports = AccountDetails;
