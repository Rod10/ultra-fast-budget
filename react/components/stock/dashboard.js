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
    this.handleRefreshPrice = this.handleRefreshPrice.bind(this);
  }

  handleAdvance() {
    axios.get("/stocks/dashboard/advance", {params: {portfolio: this.state.selectedPortfolio.id}})
      .then(response => {
        if (response.status === OK) {
          this.setState({
            stocks: response.data.stocks.rows,
            portfolios: response.data.portfolios.rows,
            transactions: response.data.transactions,
            decide: response.data?.decide,
            date: response.data.date,
            selectedPortfolio: response.data.selectedPortfolio,
          });
        }
      });
  }

  handleReset() {
    axios.get("/stocks/dashboard/reset", {params: {portfolio: this.state.portfolio}})
      .then(response => {
        if (response.status === OK) {
          this.setState({
            stocks: response.data.stocks.rows,
            portfolios: response.data.portfolios.rows,
            transactions: response.data.transactions,
            decide: response.data?.decide,
            date: response.data.date,
            selectedPortfolio: response.data.selectedPortfolio,
          });
        }
      });
  }

  handleRefreshPrice() {
    axios
      .get("/stocks/order/refresh-price")
      .then(response => {
        if (response.status === OK) {
          this.setState({stocks: response.data.stocks.rows});
        }
      })
      .catch(err => console.log(err));
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

  _renderRow(stock, index) {
    const style = this.state.selectedPortfolio?.id
      ? {}
      : {backgroundColor: stock.portfolio.account.accountType.color};
    return <tr key={`${index} - ${stock.isin}`} style={style}>
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
          {this.state.stocks.map((stock, index) => this._renderRow(stock, index))}
        </tbody>
      </table>
    );
  }

/*
NO_PRIORITY
BUY_PRIORITY
BUY_SECONDARY
INFEASIBLE
NO_TARGET
BUY_REBALANCE
ALREADY_BALANCED
*/
  _renderDecide() {
    if (this.state.decide.type === "BUY_PRIORITY") {
      return <div>
        <p>Actions prioritaire</p>
        <p>L'action prioritaire est: {this.state.decide.priority.name} avec un prix unité de: {this.state.decide.priority.currentPrice} € peut être acheter ce mois ci</p>
      </div>;
    } else if (this.state.decide.type === "BUY_SECONDARY") {
      return <>
        {this.state.decide.priority !== null
          ? <div>
            <p>Actions prioritaire</p>
            <p>L'action prioritaire est: {this.state.decide.priority.name} avec un prix unité de: {this.state.decide.priority.currentPrice} €</p>
          </div>
          : <div>
            <p>Il y a plus aucune action prioritaire, il reste maintenant a acheter au minimum une action de chaque action</p>
          </div>}
        <hr />
        <div>
          <p>Simulation</p>
          <br />
          <ul>
            {this.state.decide.secondaryCandidates.map(action => <li key={`${this.state.selectedPortfolio.id} - ${action.ticker}`}>
              {action.margin} - {action.quantity} action{action.quantity > 1 ? "s" : ""} de {action.name} pour un total de {new Decimal(action.quantity * action.currentPrice).toFixed(Constants.DECIMAL)} €, vous aurez {new Decimal(action.remainingCashNextMonth).toFixed(Constants.DECIMAL)} € le mois prochain
            </li>)}
          </ul>
        </div>
      </>;
    } else if (this.state.decide.type === "BUY_REMAINING") {
      return <>
        <div>
          <p>Il y a plus aucune action prioritaire, il reste maintenant a acheter au minimum une action de chaque action</p>
        </div>
        <div>
          <p>Actions a acheter ce mois ci:</p>
          <ul>
            {this.state.decide.stocksToBuy.map(action => <li key={`${this.state.selectedPortfolio.id} - ${action.ticker}`}>
              1 actions de {action.name} a {action.currentPrice} €
            </li>)}
          </ul>
          <p>Il restera {this.state.decide.remainingAfterPurchase} actions a acheter</p>
        </div>
      </>;
    } else if (this.state.decide.type === "INFEASIBLE") {
      return null;
    } else if (this.state.decide.type === "BUY_REBALANCE") {
      return <div>
        <p>Équilibrage de la pondération:</p>
        <ul>
          {this.state.decide.purchases.map(action => <li key={`${this.state.selectedPortfolio.id} - ${action.ticker}`}>
            {action.quantity} action{action.quantity > 1 ? "s" : ""} de {action.name} pour un total de {new Decimal(action.quantity * action.price).toFixed(Constants.DECIMAL)} €
          </li>)}
        </ul>
        <p>Il vous restera: {this.state.decide.remainingBudget} €</p>
      </div>;
    }
  }

  render() {
    const totalInvestments = this.state.stocks.reduce(
      (acc, val) => acc.plus(val.investedAmount),
      new Decimal(0),
    ).toFixed(Constants.DECIMAL);
    const totalGains = this.state.stocks
      .map(stock => new Decimal(
        (stock.quantity * stock.currentPrice) - stock.investedAmount,
      )
        .toFixed(Constants.DECIMAL))
      .reduce(
        (acc, val) => acc.plus(val),
        new Decimal(0),
      )
      .toFixed(Constants.DECIMAL);
    const totalDividends = this.state.stocks.reduce(
      (acc, val) => acc.plus(val.dividendsReceived),
      new Decimal(0),
    ).toFixed(Constants.DECIMAL);
    const liquidities = this.state.selectedPortfolio === undefined
      ? this.state.portfolios.reduce(
        (acc, val) => acc.plus(val.account.balance),
        new Decimal(0),
      ).toFixed(Constants.DECIMAL)
      : this.state.selectedPortfolio.account.balance;

    return <div className="body-content">
      <Head className="has-text-centered">
        {this.state.decide?.date}
      </Head>
      <Columns>
        <Column>
          <Button
            className="has-text-weight-bold"
            type="themed"
            icon={<Icon size="small" icon="arrow-right" />}
            label="Avancer d'un mois"
            onClick={this.handleAdvance}
          />
        </Column>
        <Column>
          <Button
            className="has-text-weight-bold"
            type="themed"
            icon={<Icon size="small" icon="arrow-right" />}
            label="Actualiser les prix"
            onClick={this.handleRefreshPrice}
          />
        </Column>
        <Column>
          <Button
            className="has-text-weight-bold"
            type="themed"
            icon={<Icon size="small" icon="arrow-right" />}
            label="Reset"
            onClick={this.handleReset}
          />
        </Column>
      </Columns>
      {this._renderFilters()}
      <hr />
      <Columns>
        <Column>
          <p>Liquiditées disponible: {liquidities} €</p>
          {this.state.selectedPortfolio && <p>Versement Mensuel: {this.state.selectedPortfolio.monthlyContribution} €</p>}
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
      {this.state.decide && this._renderDecide()}
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
