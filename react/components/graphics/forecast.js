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
const Title = require("../bulma/title.js");

const Head = require("../helpers/head.js");

const AsyncFilteredList = require("../asyncfilteredlist.js");
const Icon = require("../bulma/icon.js");

class Forecast extends AsyncFilteredList {
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
    // define properties to search
    this.s = [
      {key: "unit"},
      {key: "number"},
      {key: "type"},
    ];
    this.searchUri = "search";

    this.state = {
      ...this.defaultState(),
      ...props.query,
      graphs: null,
      unit: this.props.query.unit,
      type: this.props.query.type,
    };

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

  _getQueryString() {
    const query = new URLSearchParams();
    this.s.forEach(cur => {
      if (!this.state[cur.key] && !cur.keepNull) return;
      const value = cur.format
        ? cur.format(this.state[cur.key])
        : this.state[cur.key];
      if (Array.isArray(value)) {
        value.forEach(entry => {
          query.append(cur.replace || cur.key, entry);
        });
      } else {
        query.append(cur.replace || cur.key, value);
      }
    });
    return `?${new URLSearchParams(query).toString()}`;
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

  _renderFilters() {
    const queryStr = this._getQueryString();
    const href = `${this.searchUri + queryStr}&t=${Date.now()}`;
    return <form className="filters">
      {this._renderFilterSelect(
        "unit",
        "Période",
        [
          {
            value: "year",
            label: "Années",
          },
          {
            value: "month",
            label: "Mois",
          },
          {
            value: "week",
            label: "Semaines",
          },
        ],
        false,
      )}
      {this._renderFilterText("number", "Nombre de période")}
      {this._renderFilterSelect(
        "type",
        "Type",
        [
          {
            value: "planned",
            label: "Transaction/Virement plannifiés",
          },
          {
            value: "regression",
            label: "Régression",
          },
          {
            value: "average",
            label: "Moyenne",
          },
          {
            value: "average-weighted",
            label: "Moyenne Pondérée",
          },
          {
            value: "average-moving",
            label: "Moyenne Mobile",
          },
        ],
        false,
      )}
      <div className="field">
        <label className="label">Rafraichir</label>
        <Button
          className="has-text-weight-bold mr-3"
          type="success"
          icon={<Icon size="small" icon="rotate" />}
          href={href}
        />
      </div>
    </form>;
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

  _renderRowGraph(graph, key) {
    return <Column size={Column.Sizes.half}>
      <div key={graph.label} className={`is-${graph.column} is-flex-grow-${graph.column}`}>
        <div className="pr-2 pb-2">
          <div className={"graph-box"}>
            <Title size={5}>{graph.label}</Title>
            <div className="is-relative">
              <canvas id="chart" ref={this.charts[key]} />
            </div>
          </div>
        </div>
      </div>
    </Column>;
  }

  render() {
    const newGraphs = {...this.props.graphs};
    delete newGraphs["allForecast"];
    const graphsLabels = Forecast.splitArrayIntoChunks(Object.keys(newGraphs), 2);
    return <div className="body-content">
      <Head>
        Graphiques de toutes les catégories et sous catégories
      </Head>
      {this._renderFilters()}
      <Columns>
        <div className="column" style={{height: "500px"}}>
          {this._renderGraph("allForecast")}
        </div>
      </Columns>
      {graphsLabels.map((row, index) => <Columns key={index}>
        {row.map((key, col) => this._renderRowGraph(newGraphs[key], key))}
      </Columns>)}
    </div>;
  }
}

Forecast.displayName = "Forecast";
Forecast.propTypes = {
  notifs: PropTypes.array,
  graphs: PropTypes.object,
  query: PropTypes.object.isRequired,
};
Forecast.defaultProps = {
  notifs: undefined,
  graphs: undefined,
};

module.exports = Forecast;
