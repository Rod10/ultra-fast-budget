/* global axios */
const React = require("react");
const PropTypes = require("prop-types");
const Decimal = require("decimal.js");
const Head = require("../helpers/head.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Button = require("../bulma/button.js");
const Media = require("../bulma/media.js");
const {OK} = require("../../../express/utils/error.js");
const AsyncFilteredList = require("../asyncfilteredlist.js");
const Constants = require("../../../express/constants/constants.js");

class Dashboard extends AsyncFilteredList {
  constructor(props) {
    super(props);

    // define properties to search
    this.s = [
      {key: "portfolio"},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "/stocks/dashboard/search";

    this.base = "/stocks/dashboard";

    this.state = {
      ...this.defaultState(),
      ...props.query,
      portfolios: this.props.portfolios.rows,
      stocks: this.props.stocks.rows,
      transactions: this.props.transactions,
      date: "Janvier 2027",
    };

    this.handleAdvance = this.handleAdvance.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handleAdvance() {
    axios.get("/stocks/advance")
      .then(response => {
        if (response.status === OK) {
          this.setState({
            stocks: response.data.stocks,
            transactions: response.data.transactions,
            date: response.data.date,
          });
        }
      });
  }

  handleReset() {
    axios.get("/stocks/reset")
      .then(response => {
        if (response.status === OK) {
          this.setState({
            portfolio: response.data.portfolio,
            stocks: response.data.stocks,
            transactions: response.data.transactions,
            date: response.data.date,
          });
        }
      });
  }

  _renderFilters() {
    return <form className="filters">
      {this._renderFilterSelect(
        "portfolio",
        "Portfolio:",
        this.props.portfolios.rows
          .map(e => ({value: e.id, label: e.account.name})),
      )}
    </form>;
  }

  _renderRow(stock) {
    return <tr key={stock.isin}>
      <td className="has-text-centered">{stock.isin}</td>
      <td className="has-text-centered">{stock.name}</td>
      <td className="has-text-centered">{stock.currentPrice} €</td>
      <td className="has-text-centered">{stock.quantity}</td>
      <td className="has-text-centered">{stock.investedAmount} €</td>
      <td className="has-text-centered">{stock.average} €</td>
      <td className="has-text-centered">{((stock.quantity * stock.currentPrice) - stock.investedAmount).toFixed(Constants.DECIMAL)} €</td>
      <td className="has-text-centered">{stock.dividendsReceived} €</td>
      <td className="has-text-centered">%</td>
    </tr>;
  }

  _renderTable() {
    return (
      <table className="table is-bordered is-fullwidth is-hoverable has-pointer-cursor">
        <thead>
          <tr>
            <th className="has-text-centered">ISIN</th>
            <th className="has-text-centered">Nom</th>
            <th className="has-text-centered">Cours</th>
            <th className="has-text-centered">Quantité</th>
            <th className="has-text-centered">Montant total</th>
            <th className="has-text-centered">PRU</th>
            <th className="has-text-centered">Gains</th>
            <th className="has-text-centered">Dividendes</th>
            <th className="has-text-centered">Rendement Dividendes</th>
          </tr>
        </thead>
        <tbody>
          {this.state.stocks.map(stock => this._renderRow(stock))}
        </tbody>
      </table>
    );
  }

  render() {
    const totalInvestments = this.state.stocks.reduce(
      (acc, val) => acc.plus(val.investedAmount),
      new Decimal(0),
    ).toFixed(Constants.DECIMAL);
    const totalGains = this.state.stocks.map(stock => new Decimal((stock.quantity * stock.currentPrice) - stock.investedAmount).toFixed(Constants.DECIMAL))
      .reduce(
        (acc, val) => acc.plus(val),
        new Decimal(0),
      )
      .toFixed(Constants.DECIMAL);
    const totalDividends = this.state.stocks.reduce(
      (acc, val) => acc.plus(val.dividendsReceived),
      new Decimal(0),
    ).toFixed(Constants.DECIMAL);
    const liquidities = this.state.portfolios.reduce(
      (acc, val) => acc.plus(val.account.balance),
      new Decimal(0),
    ).toFixed(Constants.DECIMAL);

    return <div className="body-content">
      <Media
        left={<Head className="has-text-centered">
          {this.state.decide?.date}
        </Head>}
        content={<Button
          className="has-text-weight-bold"
          type="themed"
          // href="/stocks/advance"
          icon={<Icon size="small" icon="arrow-right" />}
          label="Avancer d'un mois"
          onClick={this.handleAdvance}
        />}
        right={<Button
          className="has-text-weight-bold"
          type="themed"
          // href="/stocks/advance"
          icon={<Icon size="small" icon="arrow-right" />}
          label="Reset"
          onClick={this.handleReset}
        />}
      />
      {this._renderFilters()}
      <hr />
      <Columns>
        <Column>
          <p>Liquiditées disponible: {liquidities} €</p>
          {this.state.portfolios.length <= 1 && <p>Versement Mensuel: {this.state.portfolios.monthlyContribution}€</p>}
        </Column>
        <Column>
          <p>Investissement Total: {totalInvestments} €</p>
          <p>Gain Total: {totalGains}€</p>
        </Column>
        <Column>
          <p>Total Dividendes: {totalDividends} €</p>
          <p>Rendement annuel Dividendes: 0€</p></Column>
      </Columns>
      <hr />
      {this.state.decide && <>
        <div>
          <p>Actions prioritaire</p>
          <p>L'action prioritaire est: {this.state.decide.priority.name} avec un prix unité de: {this.state.decide.priority.currentPrice} €</p>
        </div>
        <hr />
        <div>
          <p>Simulation</p>
          <br />
          <ul>
            {this.state.decide.secondaryCandidates.map(action => <li key={action.ticker}>
              {action.margin} - {action.quantity} action{action.quantity > 1 ? "s" : ""} de {action.name} pour un total de {action.quantity * action.currentPrice}, vous aurez {action.remainingCashNextMonth} € le mois prochain
            </li>)}
          </ul>
        </div>
      </>}
      <hr />
      <div>
        {this._renderTable()}
      </div>
    </div>;
  }
}
Dashboard.displayName = "Dashboard";
Dashboard.propTypes = {
  date: PropTypes.string,
  portfolio: PropTypes.object,
  decide: PropTypes.object,
};
Dashboard.defaultProps = {};

module.exports = Dashboard;
