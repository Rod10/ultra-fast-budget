const React = require("react");
const PropTypes = require("prop-types");

const OrderDirection = require("../../express/constants/orderdirection.js");
const {preventDefault} = require("../utils/html.js");

const Button = require("./bulma/button.js");
const Field = require("./bulma/field.js");
const Icon = require("./bulma/icon.js");
const Select = require("./bulma/select.js");

/* eslint-disable-next-line no-magic-numbers */
const PER_PAGE = [10, 15, 25, 50, 75, 100];
const DEFAULT_LIMIT = 100;
const DEFAULT_PAGE = 0;

class Navigation extends React.Component {
  static _renderEllips(key) {
    return <li key={key}>
      <span
        className="pagination-ellipsis"
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{__html: "&hellip;"}}
      />
    </li>;
  }

  constructor(props) {
    super(props);
    this.nbPage = 7;
    /* eslint-disable-next-line no-magic-numbers */
    this.half = Math.floor(this.nbPage / 2);
    this.low = this.half - 1;

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleToggleSortOrder = this.handleToggleSortOrder.bind(this);
  }

  getLimitAndPage() {
    let limit = this.props.limit;
    if (typeof limit === "string") {
      limit = parseInt(limit, 10);
    }
    if (isNaN(limit)) {
      limit = DEFAULT_LIMIT;
    }
    let page = this.props.page;
    if (typeof page === "string") {
      page = parseInt(page, 10);
    }
    if (isNaN(page)) {
      page = DEFAULT_PAGE;
    }
    return {limit, page};
  }

  _queryPage(nb) {
    const q = this.props.query;
    const search = new URLSearchParams({
      limit: q.limit,
      page: nb,
    });
    if (q.state) {
      if (Array.isArray(q.state)) {
        q.state.forEach(state => search.append("state", state));
      } else {
        search.append("state", q.state);
      }
    }
    if (q.notState) {
      if (Array.isArray(q.notState)) {
        q.notState.forEach(state => search.append("notState", state));
      } else {
        search.append("notState", q.notState);
      }
    }
    return `?${search.toString()}`;
  }

  handleChange(evt) {
    if (this.props.onChange) {
      this.props.onChange(evt);
    } else if (evt.target.name === "limit") {
      if (this.props.onLimitChange) return this.props.onLimitChange(evt);
    }
  }

  handleClick(evt) {
    preventDefault(evt);
    let el = evt.target;
    while (el.tagName !== "A") {
      el = el.parentElement;
    }
    const nb = parseInt(el.dataset.page, 10) || 0;
    if (nb < 0 || nb > this.lastPage) return;
    if (this.props.onChange) {
      return this.props.onChange({target: {name: "page", value: nb}});
    }
    if (this.props.onPageChange) return this.props.onPageChange(nb);
  }

  handleToggleSortOrder(evt) {
    preventDefault(evt);
    this.props.onChange({
      target: {
        name: "orderDirection",
        value: this.props.orderDirection === OrderDirection.DESC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
      },
    });
  }

  _renderPage(nb, key, page) {
    const _nb = nb + 1;
    const samePage = nb === page;
    const href = samePage ? "#" : this._queryPage(nb);
    const link = samePage
      ? (
        <a
          className="pagination-link is-current"
          aria-label={`Page ${_nb}`}
          aria-current="page"
          href={href}
        >{_nb}</a>
      )
      : (
        <a
          className="pagination-link"
          aria-label={`Aller à la page ${_nb}`}
          onClick={this.handleClick}
          data-page={nb}
          href={href}
        >{_nb}</a>
      );

    return <li key={key}>{link}</li>;
  }

  _renderPages(limit, page) {
    const p = [];
    this.lastPage = Math.floor(this.props.count / limit);
    if (this.lastPage && this.props.count % limit === 0) {
      this.lastPage--;
    }
    let key = 0;
    p.push(this._renderPage(0, key++, page));

    if (page - this.half > 0) {
      if (page - this.half === 1) {
        p.push(this._renderPage(1, key++, page));
      } else {
        p.push(Navigation._renderEllips(key++));
      }
    }
    const start = Math.max(1, page - this.low);
    const end = Math.min(this.lastPage - 1, page + this.low);
    for (let i = start; i <= end; i++) {
      p.push(this._renderPage(i, key++, page));
    }
    if (page + this.half < this.lastPage) {
      if (page + this.half === this.lastPage - 1) {
        p.push(this._renderPage(this.lastPage - 1, key++, page));
      } else {
        p.push(Navigation._renderEllips(key++));
      }
    }
    if (this.lastPage > 0) {
      p.push(this._renderPage(this.lastPage, key++, page));
    }

    return p;
  }

  _renderSort() {
    if (!this.props.sort) return null;
    return <Field
      noLabel
      className="level-item has-addons"
    >
      <Button isStatic label="Tri" />
      <Select
        raw
        name="orderBy"
        value={this.props.orderBy}
        onChange={this.props.onChange}
        options={this.props.sort.options}
      />
      <Button
        icon={this.props.orderDirection === OrderDirection.ASC
          ? <Icon icon="arrow-up" />
          : <Icon icon="arrow-down" />}
        onClick={this.handleToggleSortOrder}
      />
    </Field>;
  }

  render() {
    const {limit, page} = this.getLimitAndPage();
    return <div className="level pagination-block">
      <div className="level-left">{this.props.children}</div>
      <div className="level-right">
        {this._renderSort()}
        {!this.props.simple && <div className="level-item field has-addons">
          <div className="control">
            <a className="button is-static"># résultats / page</a>
          </div>
          <div className="control">
            <div className="select">
              <select name="limit" value={limit} onChange={this.handleChange}>
                {PER_PAGE.map(e => <option key={`limit${e}`} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>}
        <nav
          className="pagination is-small is-centered level-item"
          role="navigation"
          aria-label="pagination"
          style={{backgroundColor: "#fff"}}
        >
          <a
            className="pagination-previous"
            disabled={page === 0}
            data-page={page - 1}
            onClick={this.handleClick}
            href={this.props.simple ? this._queryPage(page - 1) : "false"}
          >Précédent</a>
          <a
            className="pagination-next"
            disabled={page === this.lastPage}
            data-page={page + 1}
            onClick={this.handleClick}
            href={this.props.simple ? this._queryPage(page + 1) : "false"}
          >Suivant</a>
          <ul className="pagination-list">{this._renderPages(limit, page)}</ul>
        </nav>
      </div>
    </div>;
  }
}
Navigation.displayName = "Navigation";
Navigation.propTypes = {
  count: PropTypes.number.isRequired,
  children: PropTypes.node,
  limit: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  onChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onPageChange: PropTypes.func,
  page: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  query: PropTypes.object, // legacy
  simple: PropTypes.bool,
  sort: PropTypes.object,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
};
Navigation.defaultProps = {
  children: undefined,
  onChange: undefined,
  onLimitChange: undefined,
  onPageChange: undefined,
  query: {},
  simple: false,
  sort: undefined,
  orderBy: "id",
  orderDirection: OrderDirection.DESC,
};

module.exports = Navigation;
