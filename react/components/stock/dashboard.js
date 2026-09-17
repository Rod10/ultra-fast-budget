/* global axios */
const React = require("react");
const PropTypes = require("prop-types");
const Head = require("../helpers/head.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Button = require("../bulma/button.js");
const Media = require("../bulma/media.js");
const {OK} = require("../../../express/utils/error.js");

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      portfolio: this.props.portfolio,
      stocks: this.props.stocks,
      transactions: this.props.transactions,
      date: this.props.date,
    };

    this.handleAdvance = this.handleAdvance.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handleAdvance() {
    axios.get("/stocks/advance")
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

  _renderRow(stock) {
    return <tr key={stock.isin}>
      <td className="has-text-centered">{stock.isin}</td>
      <td className="has-text-centered">{stock.name}</td>
      <td className="has-text-centered">{stock.currentPrice} €</td>
      <td className="has-text-centered">{stock.amount}</td>
      <td className="has-text-centered">{stock.investedAmount}</td>
      <td className="has-text-centered">{stock.average}</td>
      <td className="has-text-centered">{stock.gain}</td>
      <td className="has-text-centered">{stock.dividendsReceived}</td>
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
    const totalInvestments = this.state.stocks.reduce((acc, val) => acc + val.investedAmount, 0);
    const totalGains = this.state.stocks.reduce((acc, val) => acc + val.gain, 0);
    const totalDividends = this.state.stocks.reduce((acc, val) => acc + val.dividendsReceived, 0);
    return <div className="body-content">
      <Media
        left={<Head className="has-text-centered">
          {this.state.date}
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

      <hr />
      <Columns>
        <Column>
          <p>Liquiditées disponible: {this.state.portfolio.cash}€</p>
          <p>Versement Mensuel: {this.state.portfolio.monthlyContrib}€</p>
        </Column>
        <Column>
          <p>Investissement Total: {totalInvestments}€</p>
          <p>Gain Total: {totalGains}€</p>
        </Column>
        <Column>
          <p>Total Dividendes: {totalDividends}€</p>
          <p>Rendement annuel Dividendes: 0€</p></Column>
      </Columns>
      <hr />
      <Columns>
        <p>Simulation</p>
      </Columns>
      <hr />
      <Columns>
        <p>Actions pouvant être prises</p>
      </Columns>
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
  stocks: PropTypes.array,
  transactions: PropTypes.array,
};
Dashboard.defaultProps = {};

module.exports = Dashboard;
