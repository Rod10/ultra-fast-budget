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
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

class Homepage extends React.Component {
  constructor(props) {
    super(props);

    this.charts = [];
    if (this.props.graphs) {
      this.props.graphs.forEach(graph => {
        this.charts[graph.label] = React.createRef();
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

  createLineChart(graph, chart) {
    this.context = chart;
    const {type, data, options} = graph;
    new Chart(this.context.canvas, {
      type,
      data,
      options,
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

  render() {
    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <article className="tile is-child box">
            <Title size={4} className="mb-2">Bienvenue</Title>
            <Title size={5} className="mt-5">Vos notifications</Title>
            {this._renderNotif()}
          </article>
        </Column>
        <Column size={Column.Sizes.twoThirds}>
          <div className="is-flex graph-container">
            {this.props.graphs && this.props.graphs.length > 0
              && this.props.graphs.map(graph => <div key={graph.label} className={`is-${graph.column} is-flex-grow-${graph.column}`}>
                <div className="pr-2 pb-2">
                  <div className={"graph-box"}>
                    <Title size={5}>{graph.label}</Title>
                    <div className="is-relative">
                      <canvas id="chart" ref={this.charts[graph.label]} />
                    </div>
                  </div>
                </div>
              </div>)}
          </div>
        </Column>
      </Columns>
    </div>;
  }
}
Homepage.displayName = "HomePage";
Homepage.propTypes = {
  society: PropTypes.object,
  user: PropTypes.object,
  notifs: PropTypes.array,
  graphs: PropTypes.array,
};
Homepage.defaultProps = {
  society: undefined,
  user: undefined,
  notifs: undefined,
  graphs: undefined,
};

module.exports = Homepage;
