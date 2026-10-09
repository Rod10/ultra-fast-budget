/* global axios */
const React = require("react");
const PropTypes = require("prop-types");
const Decimal = require("decimal.js");
const Head = require("../helpers/head.js");

const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Select = require("../bulma/select.js");
const {preventDefault} = require("../../utils/html.js");
const Constants = require("../../../express/constants/constants.js");
const Input = require("../bulma/input.js");
const {getElFromDataset} = require("../../utils/html.js");
const {OK} = require("../../../express/utils/error.js");
const Icon = require("../bulma/icon");
const Button = require("../bulma/button");

class Order extends React.Component {
  static newRow(key = 0) {
    return {
      key,
      isin: "",
      name: "",
      quantity: 0,
      price: 0,
    };
  }

  constructor(props) {
    super(props);
    const stocksToBought = [Order.newRow()];
    const lastKeystocksToBought = stocksToBought.length;
    this.state = {
      decide: this.props.decide,
      lastKeystocksToBought,
      portfolios: this.props.portfolios.rows,
      selectedPortfolio: {},
      stocks: this.props.stocks.rows,
      stocksToBought,
      simulation: {
        recommendations: [],
        secondaryCandidates: [],
      },
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleStockChange = this.handleStockChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleRemoveFromList = this.handleRemoveFromList.bind(this);
    this.handleAddToList = this.handleAddToList.bind(this);
    this.handleRefreshPrice = this.handleRefreshPrice.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.formRef = React.createRef();
  }

  handleSelectChange(evt, key) {
    if (evt?.target && evt.preventDefault) preventDefault(evt);
    this.setState(prevState => {
      let _key = key;
      let value = evt;
      if (evt?.target) {
        if (!_key) _key = evt.target.name;
        value = evt.target.value;
      }
      const portfolio = value
        ? prevState.portfolios.find(p => p.account.id === parseInt(value, 10))
        : {};
      if (portfolio?.id) {
        axios.get("/stocks/order/get-portfolio-data", {params: {id: portfolio.id}})
          .then(response => {
            if (response.status === OK) {
              this.setState({
                decide: response.data.decide,
                selectedPortfolio: portfolio,
              });
            }
          })
          .catch(err => console.log(err));
      } else {
        return {selectedPortfolio: portfolio};
      }
    });
  }

  handleStockChange(evt) {
    preventDefault(evt);
    const el = getElFromDataset(evt, "key");
    const key = parseInt(el.dataset.key, 10);
    const stock = this.state.stocks.find(s => s.isin === evt.target.value);
    this.setState(prevState => ({
      stocksToBought: prevState.stocksToBought.map(entry => {
        if (entry.key === key) {
          return {
            isin: stock.isin,
            name: stock.name,
            quantity: 0,
            price: new Decimal(stock.currentPrice).toFixed(Constants.DECIMAL),
            key,
          };
        }
        return {...entry};
      }),
    }), () => {
      axios
        .get("/stocks/order/get-simulation", {params: {stocksToBought: this.state.stocksToBought, portfolioId: this.state.selectedPortfolio.id}})
        .then(response => {
          if (response.status === OK) {
            this.setState({simulation: response.data.simulation});
          }
        })
        .catch(err => console.log(err));
    });
  }

  handleQuantityChange(evt) {
    preventDefault(evt);
    const el = getElFromDataset(evt, "key");
    const key = parseInt(el.dataset.key, 10);
    const quantity = evt.target.value;

    this.setState(prevState => {
      const newStocksToBought = prevState.stocksToBought.map(entry => {
        if (entry.key === key) {
          return {
            ...entry,
            quantity,
          };
        }

        return entry;
      });

      return {stocksToBought: newStocksToBought};
    }, () => {
      axios
        .get("/stocks/order/get-simulation", {params: {stocksToBought: this.state.stocksToBought, portfolioId: this.state.selectedPortfolio.id}})
        .then(response => {
          if (response.status === OK) {
            this.setState({simulation: response.data.simulation});
          }
        })
        .catch(err => console.log(err));
    });
  }

  handleRemoveFromList(evt) {
    this.setState(prevState => {
      preventDefault(evt);
      const el = getElFromDataset(evt, "key");
      const key = parseInt(el.dataset.key, 10);
      const entries = prevState.stocksToBought.filter(e => e.key !== key);
      if (entries.length) {
        return {stocksToBought: entries};
      }
      return {
        stocksToBought: [Order.newRow()],
        stocksToBoughtLastKey: 0,
      };
    });
  }

  handleAddToList(evt) {
    this.setState(prevState => ({
      lastKeystocksToBought: prevState.lastKeystocksToBought + 1,
      stocksToBought: prevState.stocksToBought
        .concat(Order.newRow(prevState.lastKeystocksToBought + 1)),
    }));
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

  handleConfirmClick() {
    this.formRef.current.submit();
  }

  /* eslint-disable-next-line class-methods-use-this */
  _renderFilterWrapper(label, childs) {
    return <div className="field">
      <label className="label">{label}</label>
      {childs}
    </div>;
  }

  _renderFilterSelect(key, label, options, all = true) {
    return this._renderFilterWrapper(
      label,
      <div className="control">
        <div className="select is-fullwidth">
          <select
            name={key}
            value={this.state[key]}
            onChange={this.handleSelectChange}
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

  _renderPortfolioSelect() {
    return this._renderFilterSelect(
      "portfolio",
      "Portfolio:",
      [{value: null, label: "Choississez un portfolio"}, ...this.state.portfolios
        .map(e => ({value: e.id, label: e.account.name}))],
      false,
    );
  }

  _renderBeforeRow(stock) {
    return <tr key={stock.isin}>
      <td className="has-text-centered">{stock.name}</td>
      <td className="has-text-centered">{stock.quantity}</td>
      <td className="has-text-centered">{stock.investedAmount} €</td>
      <td className="has-text-centered">{stock.average} €</td>
      <td className="has-text-centered">{stock.weight} %</td>
      <td className="has-text-centered">{stock.targetWeight} %</td>
    </tr>;
  }

  // <td className="has-text-centered">"this.state.simulation.recommandations.find(recommandation => recommandation.isin === stock.isin).newAverage €</td>

  _renderBeforeTable() {
    return (
      <table className="table is-bordered is-fullwidth is-hoverable has-pointer-cursor">
        <thead>
          <tr>
            <th className="has-text-centered">Nom</th>
            <th className="has-text-centered">Quantité</th>
            <th className="has-text-centered">Montant total</th>
            <th className="has-text-centered">PRU</th>
            <th className="has-text-centered">Pondération réel</th>
            <th className="has-text-centered">Pondération cible</th>
          </tr>
        </thead>
        <tbody>
          {this.state.stocks
            .filter(s => s.portfolioId === this.state.selectedPortfolio.id)
            // .filter(s => this.state.stocksToBought.find(sB => sB.isin === s.isin))
            .map(stock => this._renderBeforeRow(stock))}
        </tbody>
      </table>
    );
  }

  _renderAfterRow(stock) {
    const simulation = this.state.simulation?.recommendations
      ?.find(recommandation => recommandation.isin === stock.isin);

    return <tr key={stock.isin}>
      <td className="has-text-centered">{stock.name}</td>
      <td className="has-text-centered">{simulation?.quantity}</td>
      <td className="has-text-centered">{simulation?.newInvestedAmount} €</td>
      <td className="has-text-centered">
        {simulation?.newAverage ?? "-"} €
      </td>
      <td className="has-text-centered">
        {simulation?.newWeight ?? "-"} %
      </td>
      <td className="has-text-centered">{stock.targetWeight} %</td>
    </tr>;
  }

  _renderAfterTable() {
    return (
      <table className="table is-bordered is-fullwidth is-hoverable has-pointer-cursor">
        <thead>
          <tr>
            <th className="has-text-centered">Nom</th>
            <th className="has-text-centered">Quantité</th>
            <th className="has-text-centered">Montant total</th>
            <th className="has-text-centered">PRU</th>
            <th className="has-text-centered">Pondération réel</th>
            <th className="has-text-centered">Pondération cible</th>
          </tr>
        </thead>
        <tbody>
          {this.state.stocks
            .filter(s => s.portfolioId === this.state.selectedPortfolio.id)
            .filter(s => this.state.stocksToBought.find(sB => sB.isin === s.isin))
            .map(stock => this._renderAfterRow(stock))}
        </tbody>
      </table>
    );
  }

  render() {
    return <div className="body-content">
      <Head>
        Effectuer un ordre
      </Head>
      <br />
      <Columns>
        <Column size={Column.Sizes.oneFifth}>
          {this._renderPortfolioSelect()}
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
            label="Confirmer"
            onClick={this.handleConfirmClick}
          />
        </Column>
      </Columns>
      <hr />
      <form
        ref={this.formRef}
        method="POST"
        action="/stocks/order/new"
      >
        {this.state.selectedPortfolio?.account
          ? <Columns>
            <input
              className="is-hidden"
              name="portfolioId"
              defaultValue={this.state.selectedPortfolio.id}
              readOnly
            />
            <Column>
              <Columns>
                <Column>
                  <p>Fonds disponible: {this.state.selectedPortfolio.account.balance} €</p>
                </Column>
                <Column>
                  <p>Fonds restant: {new Decimal(this.state.selectedPortfolio.account.balance)
                    .sub(this.state.stocksToBought
                      .reduce(
                        (acc, val) => acc.plus(val.price * val.quantity),
                        new Decimal(0),
                      ))
                    .toFixed(Constants.DECIMAL)} €</p>
                </Column>
              </Columns>
              {/* <Columns>
                <Column>
                  <p>Actions:</p>
                </Column>
                <Column>
                  <p>Quantité:</p>
                </Column>
                <Column>
                  <p>Prix Unité:</p>
                </Column>
                <Column>
                  <p>Total:</p>
                </Column>
                <Column />
              </Columns> */}
              {this.state.stocksToBought.map((stock, index) => <Columns key={stock.isin}>
                <Column key={stock.isin}>
                  <Select
                    name={`stocksToBought[${index}][isin]`}
                    defaultValue={stock.isin}
                    options={[{value: null, label: "Choississez une action"}, ...this.state.stocks
                      .filter(s => s.portfolioId === this.state.selectedPortfolio.id
                    && new Decimal(s.currentPrice).lte(
                      this.state.selectedPortfolio.account.balance,
                    ))
                      .map(s => ({
                        value: s.isin,
                        label: s.name,
                      }))]}
                    data-key={stock.key}
                    onChange={this.handleStockChange}
                    label={index === 0 ? "Action" : ""}
                    noLabel={index >= 1}
                  />
                </Column>
                {this.state.stocksToBought[index].isin !== "" && <>
                  <Column>
                    <Input
                      className="input"
                      placeholder="Quantité"
                      type="number"
                      name={`stocksToBought[${index}][quantity]`}
                      value={stock.quantity}
                      data-key={stock.key}
                      onChange={this.handleQuantityChange}
                      min={0}
                      max={Math.floor(this.state.selectedPortfolio.account.balance / stock.price)}
                      helper={`Max: ${Math.floor(
                        this.state.selectedPortfolio.account.balance / stock.price,
                      )} Recommander: ${
                        this.state.simulation?.recommendations
                          ?.find(recommandation => recommandation.isin === stock.isin)
                          ?.recommended ?? ""
                      }`}
                      label={index === 0 ? "Quantité" : ""}
                      noLabel={index >= 1}
                    />
                  </Column>
                  <Column>
                    <Input
                      className="input"
                      placeholder="Prix Unité"
                      type="text"
                      name={`stocksToBought[${index}][price]`}
                      value={`${stock.price}`}
                      readOnly
                      label={index === 0 ? "Prix Unité (€)" : ""}
                      noLabel={index >= 1}
                    />
                  </Column>
                  <Column>
                    <Input
                      className="input"
                      placeholder="Total"
                      type="text"
                      name={`stocksToBought[${index}][investedAmount]`}
                      value={`${stock.price * stock.quantity}`}
                      readOnly
                      label={index === 0 ? "Total (€)" : ""}
                      noLabel={index >= 1}
                    />
                  </Column>
                  <Column>
                    <button
                      type="button"
                      className="button"
                      data-btn="remove"
                      data-key={stock.key}
                      onClick={this.handleRemoveFromList}
                    >
                      <span className="icon">
                        <i className="fa fa-times" />
                      </span>
                    </button>
                  </Column>
                </>}
              </Columns>)}
              <Columns>
                <Column />
                <Column />
                <Column />
                <Column />
                <Column
                  size={Column.Sizes.oneFifth}
                >
                  <p>Total: {new Decimal(this.state.stocksToBought.reduce(
                    (acc, val) => acc.plus(val.price * val.quantity),
                    new Decimal(0),
                  )).toFixed(Constants.DECIMAL)} €</p>
                </Column>
                <Column
              // offset={Column.Offsets.oneFifth}
                  size={Column.Sizes.oneFifth}
                >
                  <button
                    type="button"
                    className="button"
                    data-btn="add"
                    onClick={this.handleAddToList}
                  >
                    <span className="icon">
                      <i className="fa fa-plus" />
                    </span>
                  </button>
                </Column>
              </Columns>
            </Column>
            <hr className="hr-vertical" />
            {this.state.selectedPortfolio.needDecide && <Column>
              <div>
                <p>Actions prioritaire</p>
                <p>L'action prioritaire est: {this.state.decide.priority.name} avec un prix unité de: {this.state.decide.priority.currentPrice} €</p>
              </div>
              <hr />
              <div>
                <p>Simulation à M+1</p>
                <p>Fonds Disponible: {new Decimal(this.state.selectedPortfolio.account.balance).sub(this.state.stocksToBought.reduce(
                  (acc, val) => acc.plus(val.price * val.quantity),
                  new Decimal(0),
                ))
                  .add(this.state.selectedPortfolio.monthlyContribution)
                  .toFixed(Constants.DECIMAL)} €</p>
              </div>
              <div>
                <p>Vous pourriez acheter:</p>
                <ul>
                  {this.state.simulation.secondaryCandidates.map(stock => <li key={stock.ticker}>
                    {stock.name}: {stock.quantity} à {stock.currentPrice} € et il vous restera: {stock.remainingCashNextMonth} €
                  </li>)}
                </ul>
              </div>
              <hr className="hr-vertical" />
              <div>
                <p>Avant</p>
                {this._renderBeforeTable()}
              </div>
              <hr className="hr-vertical" />
              {this.state.stocksToBought[0].quantity >= 1 && <div>
                <p>Après</p>
                {this._renderAfterTable()}
              </div>}
            </Column>}
          </Columns>
          : " Sélectionner un portfolio"}
      </form>
    </div>;
  }
}

Order.displayName = "Order";
Order.propTypes = {
  portfolios: PropTypes.object.isRequired,
  stocks: PropTypes.object.isRequired,
  decide: PropTypes.object.isRequired,
  simulation: PropTypes.object.isRequired,
};

module.exports = Order;
