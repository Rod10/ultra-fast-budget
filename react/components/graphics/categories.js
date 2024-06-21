const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

const Button = require("../bulma/button.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");

const Head = require("../helpers/head.js");

const TransactionBlock = require("../transaction/transactionblock.js");
const BudgetBlock = require("../budget/budgetblock.js");

class Categories extends React.Component {
  static splitArrayIntoChunks(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  constructor(props) {
    super(props);

    this.charts = {};

    if (this.props.graphs) {
      Object.keys(this.props.graphs).forEach(key => {
        this.charts[`${key}`] = React.createRef();
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
        const graph = this.props.graphs[key];
        if (graph.type === "pie") {
          this.createPieChart(graph, this.charts[`${key}`].current.getContext("2d"));
        } else if (graph.type === "line") {
          this.createLineChart(graph, this.charts[`${key}`].current.getContext("2d"));
        } else if (graph.type === "bar") {
          this.createBarChart(graph, this.charts[`${key}`].current.getContext("2d"));
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
    const {label, labels, backgroundColor, options} = graph;
    const data = {
      labels,
      datasets: graph.datasets,
    };
    new Chart(this.context.canvas, {
      type: "bar",
      data,
      options: {
        scales: {y: {beginAtZero: true}},
        ...options,
      },
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

  _renderGraph(type) {
    const graph = this.props.graphs[type];

    return <div className={`is-${graph.column} is-flex-grow-${graph.column}`}>
      <div className="pr-2 pb-2">
        <div className={"graph-box"}>
          <Title size={5}>{graph.label}</Title>
          <div className="is-relative">
            <canvas id="chart" ref={this.charts[`${type}`]} style={{height: "390px"}} />
          </div>
        </div>
      </div>
    </div>;
  }

  _renderRowGraph(graph) {
    return <Column size={Column.Sizes.oneQuarter}>
      <div key={graph.label} className={`is-${graph.column} is-flex-grow-${graph.column}`}>
        <div className="pr-2 pb-2">
          <div className={"graph-box"}>
            <Title size={5}>{graph.label}</Title>
            <div className="is-relative">
              <canvas id="chart" ref={this.charts[graph.label]} />
            </div>
          </div>
        </div>
      </div>
    </Column>;
  }

  render() {
    const newGraphs = {...this.props.graphs};
    delete newGraphs["allCategories"];
    const graphsLabels = Categories.splitArrayIntoChunks(Object.keys(newGraphs), 4);
    return <div className="body-content">
      <Head>
        Graphiques de toutes les catégories et sous catégories
      </Head>
      <Columns>
        <div className="column" style={{height: "500px"}}>
          {this._renderGraph("allCategories")}
        </div>
      </Columns>
      {graphsLabels.map((row, index) => <Columns key={index}>
        {row.map((key, col) => this._renderRowGraph(newGraphs[key], index, col))}
      </Columns>)}
    </div>;
  }
}

Categories.displayName = "Categories";
Categories.propTypes = {
  notifs: PropTypes.array,
  graphs: PropTypes.object,
};
Categories.defaultProps = {
  notifs: undefined,
  graphs: undefined,
};

module.exports = Categories;
