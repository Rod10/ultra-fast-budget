const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

const Button = require("./bulma/button.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");

const Head = require("./helpers/head.js");

const TransactionBlock = require("./transaction/transactionblock.js");
const BudgetBlock = require("./budget/budgetblock.js");

class Homepage extends React.Component {
  constructor(props) {
    super(props);

    this.charts = {};

    if (this.props.graphs) {
      Object.keys(this.props.graphs).forEach(key => {
        Object.keys(this.props.graphs[key]).forEach(graphKey => {
          this.charts[`${key}-${graphKey}`] = React.createRef();
        });
      });
    }
  }

  componentDidMount() {
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(BarController);
    Chart.register(BarElement);
    Chart.register(...registerables);

    if (this.props.graphs) {
      Object.keys(this.props.graphs).forEach(key => {
        Object.keys(this.props.graphs[key]).forEach(graphKey => {
          const graph = this.props.graphs[key][graphKey];
          if (graph.type === "pie") {
            this.createPieChart(graph, this.charts[`${key}-${graphKey}`].current.getContext("2d"));
          } else if (graph.type === "line") {
            this.createLineChart(graph, this.charts[`${key}-${graphKey}`].current.getContext("2d"));
          } else if (graph.type === "bar") {
            this.createBarChart(graph, this.charts[`${key}-${graphKey}`].current.getContext("2d"));
          }
        });
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

  createLineChart(graph, chart) {
    this.context = chart;
    const {type, data, options} = graph;
    new Chart(this.context.canvas, {
      type,
      data,
      options,
    });
  }

  createBarChart(graph, chart) {
    this.context = chart;
    const {label, labels, backgroundColor} = graph;
    const data = {
      labels,
      datasets: graph.datasets,
    };
    new Chart(this.context.canvas, {
      type: "bar",
      data,
      options: {scales: {y: {beginAtZero: true}}},
    });
  }

  /* eslint-disable indent */
  _renderNotif() {
    const {notifs} = this.props;
    const type = {
      "default": "",
      "info": "ℹ️",
      "success": "✅",
      "warning": "⚠️",
      "danger": "❌",
    };
    return <div className="content">

      {notifs && notifs.length > 0
        ? notifs.map(notif => <div
            className={`graph-box mb-2 ${type[notif.status]}`}
            key={notif.body}
        >
          <b>
            {type[notif.status]} {notif.body}
          </b>
          {
            notif.text && notif.text.length > 0
            && <ul>
              {
                notif.text.slice(0, this.limit).map(text => <li key={text}>
                  {text}
                </li>)
              }
            </ul>
          }
          {
            notif.action
            && <Button
              className="has-text-weight-bold"
              type="themed"
              href={notif.action.url}
              icon={<Icon size="small" icon="arrow-right" />}
              label={notif.action.label}
            />
          }
        </div>)
        : <p>🎉 Vous n'avez aucune notification, vous pouvez soufflez 🌴</p>}
    </div>;
  }

  _renderGraph(type, subType) {
    const graph = this.props.graphs[type][subType];
    const className = this.props.graphs[type][subType].type === "pie" ? "homepage-chart" : null;
    const side = this.props.graphs[type][subType].type === "pie";
    return <div className={`is-${graph.column} is-flex-grow-${graph.column}`}>
      <div className="pr-2 pb-2">
        <div className={"graph-box"}>
          <Title size={5}>{graph.label}</Title>
          {side === true ? <Columns className="is-vcentered">
            <Column>
              <div className="is-relative">
                <canvas className={className} id="chart" ref={this.charts[`${type}-${subType}`]} />
              </div>
            </Column>
            <Column>
              <Columns className="is-centered">
                <Column className="has-text-left">
                  <Icon size="small" icon="arrow-up" />
                </Column>
                <Column className="has-text-right">
                  <Title size={5}>
                    <span className="has-text-success">
                      {this.props.graphs[type][subType].data[0]}
                    </span> €
                  </Title>
                </Column>
              </Columns>
              <Columns>
                <Column className="has-text-left">
                  <Icon size="small" icon="arrow-down" />
                </Column>
                <Column className="has-text-right">
                  <Title size={5}>
                    <span className="has-text-danger">
                      {this.props.graphs[type][subType].data[1]}
                    </span> €
                  </Title>
                </Column>
              </Columns>
              <hr className="hr-homepage" />
              <Columns className="is-centered">
                <Title size={5}>
                  {Math.round(((this.props.graphs[type][subType].data[0] - this.props.graphs[type][subType].data[1]) + Number.EPSILON) * 100) / 100} €
                </Title>
              </Columns>
            </Column>
          </Columns>
            : <div className="is-relative">
              <canvas className={className} id="chart" ref={this.charts[`${type}-${subType}`]} />
            </div>}
        </div>
      </div>
    </div>;
  }

  render() {
    return <div className="body-content">
      <Head>
        Vue d'ensemble
      </Head>
      <Columns className="is-mobile is-multiline is-centered">
        <Column>
          <div>
            <Columns className="is-mobile is-multiline is-centered">
              <Column size={Column.Sizes.oneThird}>{this._renderGraph("summary", "thisMonth")}</Column>
              <Column size={Column.Sizes.oneThird}>{this._renderGraph("summary", "lastMonth")}</Column>
            </Columns>
          </div>
        </Column>
      </Columns>
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <div className="box">
            <b>Comptes: </b>
            {this.props.accounts.rows.map(account => <Columns key={account.id}>
              <Column className="has-text-left">
                <span
                  className={`tag ${account.accountType.tag} is-small is-rounded`}
                  title={account.accountType.name}
                >{account.accountType.name}</span>
              </Column>
              <Column className="has-text-right">
                <b>{account.balance} €</b>
              </Column>
            </Columns>)}
          </div>
        </Column>
        <Column size={Column.Sizes.oneThird}>{this._renderGraph("details", "seventhDays")}</Column>
        <Column size={Column.Sizes.oneThird}>
          <div className="box">
            <div className="content transaction-homepage-scrollblock">
              {this.props.transactions.rows.map(transaction => <div
                className="mb-2"
                data-transactionid={transaction.id}
                key={transaction.id}
              >
                <TransactionBlock
                  key={transaction.id}
                  transaction={transaction}
                  homepage
                />
              </div>)}
            </div>
          </div>
        </Column>
      </Columns>
      <Columns>
        <Column size={Column.Sizes.oneThird}>{this._renderGraph("details", "balance")}</Column>
        <Column size={Column.Sizes.oneThird}>
          <div className="box">
            {this.props.budgets.rows.map(budget => <div
              className="mb-2"
              data-transactionid={budget.id}
              key={budget.id}
            >
              <BudgetBlock
                key={budget.id}
                budget={budget}
                homepage
              />
            </div>)}
          </div>
        </Column>
        <Column size={Column.Sizes.oneThird}>
          <div className="box">
            <b>Liquidités (Transaction)</b>
            <table className="table is-bordered is-fullwidth">
              <thead>
                <tr>
                  <th><Icon size="small" icon="arrow-left" /> Juin <Icon size="small" icon="arrow-right" /></th>
                  <th>Revenus</th>
                  <th>Dépense</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total</td>
                  <td>{this.props.liquidity.totalIncome} €</td>
                  <td>- {this.props.liquidity.totalOutcome} €</td>
                </tr>
                <tr>
                  <td>Transactions</td>
                  <td>{this.props.liquidity.incomeTransactionsNumber}</td>
                  <td>{this.props.liquidity.outcomeTransactionsNumber}</td>
                </tr>
                <tr>
                  <td>Moyenne (jour)</td>
                  <td>{this.props.liquidity.average.daily.income} €</td>
                  <td>- {this.props.liquidity.average.daily.outcome} €</td>
                </tr>
                <tr>
                  <td>Moyenne (transactions)</td>
                  <td>{this.props.liquidity.average.transactions.income} €</td>
                  <td>- {this.props.liquidity.average.transactions.outcome} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Column>
      </Columns>
    </div>;
  }
}

Homepage.displayName = "HomePage";
Homepage.propTypes = {
  notifs: PropTypes.array,
  graphs: PropTypes.object,
  accounts: PropTypes.object,
  transactions: PropTypes.object,
  budgets: PropTypes.object,
  liquidity: PropTypes.object,
};
Homepage.defaultProps = {
  notifs: undefined,
  graphs: undefined,
  accounts: undefined,
  transactions: undefined,
  budgets: undefined,
  liquidity: undefined,
};

module.exports = Homepage;
