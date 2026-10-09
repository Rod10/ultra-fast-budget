const React = require("react");
const PropTypes = require("prop-types");

// const TransactionType = require("../express/constants/transactiontype.js");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const DatePicker = require("../datepicker.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const OrderTypeFull = require("../../../express/constants/ordertypefull.js");
const AsyncFilteredList = require("./../asyncfilteredlist.js");

const OrderBlock = require("./orderblock.js");

class OrderList extends AsyncFilteredList {
  constructor(props) {
    super(props);

    // define properties to search
    this.s = [
      {key: "startingDate", format: date => date.toISOString()},
      {key: "endingDate", format: date => date.toISOString()},
      {key: "portfolio"},
      {key: "type"},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "order/search";

    this.base = "/order/";

    this.state = {
      ...this.defaultState(),
      ...props.query,
      currentOrder: null,
      rows: this.props.orders.rows,
      stocks: this.props.stocks.rows,
    };

    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
  }

  handleCloseDetails() {
    this.setState({currentOrder: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "orderid");
    const orderId = parseInt(el.dataset.orderid, 10);
    const order = this.state.rows.find(acc => acc.id === orderId);
    this.setState({currentOrder: order});
  }

  _renderFilters() {
    return <form className="filters">
      {this._renderFilterWrapper(
        "Du: ",
        <DatePicker
          name="startingDate"
          selected={this.state.startingDate}
          autoComplete="off"
          onChangeLegacy={date => this.handleChange(date, "startingDate")}
        />,
      )}
      {this._renderFilterWrapper(
        "Au: ",
        <DatePicker
          name="endingDate"
          selected={this.state.endingDate}
          autoComplete="off"
          onChangeLegacy={date => this.handleChange(date, "endingDate")}
        />,
      )}
      {this._renderFilterSelect(
        "portfolio",
        "Portfolio:",
        this.props.portfolios.rows
          .map(e => ({value: e.id, label: e.account.name})),
      )}
      {this._renderFilterSelect(
        "type",
        "Type:",
        Object.keys(OrderTypeFull).map(e => ({value: e, label: OrderTypeFull[e].name})),
      )}
    </form>;
  }

  render() {
    const list = this.state.rows.map(order => <div
      className="mb-2"
      data-orderid={order.id}
      onClick={this.handleOpenDetails}
      key={order.id}
    >
      <OrderBlock
        base={this.base}
        user={this.props.user}
        key={order.id}
        order={order}
        stocks={this.state.stocks}
      />
    </div>);

    /* const expanded = this.state.currentTransaction !== null
      && <TransactionExpanded
        base={this.base}
        key={this.state.currentTransaction.id}
        transaction={this.state.currentTransaction}
        onClose={this.handleCloseDetails}
        user={this.props.user}
        onClick={() => this.openTransactionModal({type: this.state.currentTransaction.type, transaction: this.state.currentTransaction, categories: this.props.categories, accounts: this.props.accounts.rows})}
      />; */

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Historique des ordres</Title>
        </Column>
      </Columns>
      {this._renderFilters()}
      <hr />
      <Columns>
        <div className="column">
          <div className="content operator-scrollblock">
            {list}
          </div>
        </div>
        {/* expanded */}
      </Columns>
    </div>;
  }
}

OrderList.displayName = "OrderList";
OrderList.propTypes = {
  user: PropTypes.object.isRequired,
  portfolios: PropTypes.object.isRequired,
  orders: PropTypes.object.isRequired,
  stocks: PropTypes.array.isRequired,
};
OrderList.defaultProps = {graphs: undefined};

module.exports = OrderList;
