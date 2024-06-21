/* global axios */
const React = require("react");
const PropTypes = require("prop-types");

const {OK} = require("../../express/utils/error.js");
const OrderDirection = require("../../express/constants/orderdirection.js");
const {preventDefault} = require("../utils/html.js");

const DEFAULT_LIMIT = 15;
const INPUT_TIMEOUT = 500;

class AsyncFilteredList extends React.Component {
  static _updateUriSearch(queryStr) {
    const newurl = window.location.pathname + queryStr;
    window.history.replaceState({path: newurl}, "", newurl);
  }

  constructor(props) {
    super(props);

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
          const graphs = response.data.graphs ? response.data.graphs : null;
          this.setState({
            graphs,
            count: response.data.count,
            rows: this.adapter ? response.data.rows.map(this.adapter) : response.data.rows,
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
      orderBy: this.props.query.orderBy || "id",
      orderDirection: this.props.query.orderDirection || OrderDirection.DESC,
      limit: this.props.query.limit,
      page: this.props.query.page,
      count: this.props.query.count,
      unit: this.props.query.month || "month",
      number: this.props.query.number || 12,
      type: this.props.query.type || "planned",
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
            value={this.statekey}
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
}
AsyncFilteredList.displayName = "AsyncFilteredList";
AsyncFilteredList.propTypes = {query: PropTypes.object};
AsyncFilteredList.defaultProps = {
  query: {
    count: 1,
    limit: DEFAULT_LIMIT,
    page: 0,
  },
};

module.exports = AsyncFilteredList;
