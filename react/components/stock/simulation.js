/* global axios */
const React = require("react");
const PropTypes = require("prop-types");
const Decimal = require("decimal.js");
const {format, getDaysInMonth} = require("date-fns");
const {fr} = require("date-fns/locale");
const Head = require("../helpers/head.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Button = require("../bulma/button.js");
const Media = require("../bulma/media.js");
const {OK} = require("../../../express/utils/error.js");
const AsyncFilteredList = require("../asyncfilteredlist.js");
const Constants = require("../../../express/constants/constants.js");
const DatePicker = require("../datepicker.js");
const OrderTypeFull = require("../../../express/constants/ordertypefull.js");
const OrderDirection = require("../../../express/constants/orderdirection.js");
const {preventDefault} = require("../../utils/html.js");
const DEFAULT_LIMIT = 15;
const INPUT_TIMEOUT = 500;
const MONTHS_PER_COLUMN = 4;

class Simulation extends React.Component {
  constructor(props) {
    super(props);

    // define properties to search
    this.s = [
      {key: "portfolio"},
      {key: "year"},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "/stocks/simulation/search";

    this.base = "/stocks/simulation";

    this.state = {
      ...this.defaultState(),
      simulation: this.props.simulation,
      year: new Date(),
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.getQueryObject = this.getQueryObject.bind(this);
  }

  componentDidMount() {
    AsyncFilteredList._updateUriSearch(this._getQueryString());
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.qId === this.state.qId) return;

    const queryStr = this._getQueryString();
    AsyncFilteredList._updateUriSearch(queryStr);

    const doSearch = () => axios.get(`${this.searchUri + queryStr}&t=${Date.now()}`)
      .then(response => {
        if (response.status === OK) {
          this.setState({
            portfolios: response.data?.portfolios,
            simulation: response.data?.simulation,
          });
        }
      });
    if (this.delaiLastSearch) {
      clearTimeout(this.delaiTimeout);
      this.delaiTimeout = setTimeout(doSearch, INPUT_TIMEOUT);
    } else {
      doSearch();
    }
  }

  defaultState() {
    return {
      qId: 0,
      orderBy: "id",
      orderDirection: OrderDirection.DESC,
      year: new Date(),
    };
  }

  getQueryObject(withTime) {
    const query = {};
    this.s.forEach(cur => {
      if (!this.state[cur.key] && !cur.keepNull) return;
      const value = cur.format
        ? cur.format(this.state[cur.key])
        : this.state[cur.key];
      query[cur.replace || cur.key] = value;
    });
    if (withTime) {
      query.append("t", Date.now());
    }
    return query;
  }

  _getQueryString(withTime) {
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
    if (withTime) {
      query.append("t", Date.now());
    }
    return `?${new URLSearchParams(query).toString()}`;
  }

  handleChange(evt, key) {
    if (evt?.target && evt.preventDefault) preventDefault(evt);
    let _key = key;
    let value = evt;
    if (evt?.target) {
      if (!_key) _key = evt.target.name;
      value = evt.target.value;
      this.delaiLastSearch = Boolean(evt.target.tagName === "INPUT"
        && evt.target.type === "text");
    }
    this.setState(prevState => ({
      page: 0,
      [_key]: value,
      qId: prevState.qId + 1,
    }));
  }

  handleRefresh() {
    this.setState(prevState => ({qId: prevState.qId + 1}));
  }

  /* eslint-disable-next-line class-methods-use-this */
  _renderFilterWrapper(label, childs) {
    return <div className="field">
      <label className="label">{label}</label>
      {childs}
    </div>;
  }

  _renderFilterText(key, label) {
    return this._renderFilterWrapper(
      label,
      <div className="control">
        <input
          className="input"
          name={key}
          value={this.state[key]}
          onChange={this.handleChange}
        />
      </div>,
    );
  }

  _renderFilterSelect(key, label, options, all = true) {
    return this._renderFilterWrapper(
      label,
      <div className="control">
        <div className="select is-fullwidth">
          <select
            name={key}
            value={this.state[key]}
            onChange={this.handleChange}
          >
            {all && <option value="">Tout</option>}
            {options.map(e => <option
              key={label + (e.value || e.label)}
              value={e.value || e.label}
            >{e.label}</option>)}
          </select>
        </div>
      </div>,
    );
  }

  _renderFilters() {
    return <form className="filters">
      {this._renderFilterWrapper(
        "Du: ",
        <DatePicker
          name="year"
          selected={new Date(this.state.year)}
          dateFormat="yyyy"
          autoComplete="off"
          onChangeLegacy={date => this.handleChange(date, "year")}
          showYearPicker
        />,
      )}
      {this._renderFilterSelect(
        "portfolio",
        "Portfolio:",
        this.props.portfolios.rows
          .map(e => ({value: e.id, label: e.account.name})),
      )}
    </form>;
  }

  _renderMonth(month, index) {
    const date = new Date(this.state.year.getFullYear(), index, 1);
    const days = [];
    const liquidity = [];
    const gains = [];
    for (let i = 0; i < getDaysInMonth(date); i++) {
      if (!month[i] && month[i - 1]) {
        month[i] = month[i - 1];
        month[i].events = [];
        month[i].gains = 0;
      }

      days.push(<div className="has-text-centered"><p>{i + 1}</p></div>);
      liquidity.push(<div className="has-text-centered"><p>{month[i]?.liquidity ?? 0}</p></div>);
      gains.push(<div className="has-text-centered"><p>{month[i]?.gains ?? 0}</p></div>);
    }
    return <Column size={Column.Sizes.oneQuarter}>
      <div className="box">
        <div className="has-text-centered">
          {format(date, "MMMM", {locale: fr})}
        </div>
        <hr className="hr-homepage" />
        <Columns>
          <Column>
            {days}
          </Column>
          <hr className="hr-vertical-dark" />
          <Column>
            {liquidity}
          </Column>
          <hr className="hr-vertical-dark" />
          <Column>
            {gains}
          </Column>
        </Columns>
      </div>
    </Column>;
  }

  render() {
    const totalMonths = new Decimal(this.state.simulation.monthsData.filter(month => month.length !== 0).length);
    return <div className="container is-fluid">
      <Head className="has-text-centered">
        Simulation/Prévision
      </Head>
      {this._renderFilters()}
      <hr />
      <Columns>
        <Column>
          <div className="box slide-in is-clickable">
            <div className="columns is-flex">
              <Column>
                <b>Début: </b>
                <br />
                <b>Fin: </b>
              </Column>
              <Column>
                <b>{this.state.simulation.header.startBalance} €</b>
                <br />
                <b>{this.state.simulation.header.endBalance} €</b>
              </Column>
            </div>
          </div>
        </Column>
        <Column>
          <div className="box slide-in is-clickable">
            <div className="columns is-flex">
              <Column>
                <b>Gain Total: </b>
                <br />
                <b>Gain Net: </b>
              </Column>
              <Column>
                <b>{this.state.simulation.header.totalGain} €</b>
                <br />
                <b>{this.state.simulation.header.netGain} €</b>
              </Column>
            </div>
          </div>
        </Column>
        <Column>
          <div className="box slide-in is-clickable">
            <div className="columns is-flex">
              <Column>
                <b>Gain Intérêts: </b>
                <br />
                <b>Gain Dividendes: </b>
              </Column>
              <Column>
                <b>{this.state.simulation.header.interestGain} €</b>
                <br />
                <b>{this.state.simulation.header.dividendGain} €</b>
              </Column>
            </div>
          </div>
        </Column>
      </Columns>
      <Columns>
        {this.state.simulation.monthsData.slice(0, 4).map((month, index) => this._renderMonth(month, index))}
      </Columns>
      <Columns>
        {this.state.simulation.monthsData.slice(5, 9).map((month, index) => this._renderMonth(month, index + 4))}
      </Columns>
      <Columns>
        {this.state.simulation.monthsData.slice(5, 9).map((month, index) => this._renderMonth(month, index + 8))}
      </Columns>
    </div>;
  }
}

Simulation.displayName = "Simulation";
Simulation.propTypes = {
  simulation: PropTypes.object,
  portfolios: PropTypes.array,
};
Simulation.defaultProps = {};

module.exports = Simulation;
