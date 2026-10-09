const React = require("react");
const PropTypes = require("prop-types");
const df = require("dateformat");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const OrderTypesFull = require("../../../express/constants/ordertypefull.js");
const OrderType = require("../../../express/constants/ordertype.js");

class OrderBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  _renderOrderBody() {
    const order = this.props.order;
    const stocks = this.props.stocks;
    return <>
      <Column size="is-2">
        <div>
          <p>{df(order.receivedAt, "dd/mm/yyyy - hh:MM")} •&nbsp;</p>
          <p>{order.portfolio.account.name}</p>
        </div>
      </Column>
      <Column size="is-2">
        <div>
          <p>{stocks.find(stock => stock.isin === order.isin).name}</p>
          <p>{order.quantity}</p>
        </div>
      </Column>
      <Column size="is-2">
        <div>
          <p>Prix/u</p>
          <p>{order.price} €</p>
        </div>
      </Column>
      <Column size="is-2">
        <div>
          <p>Taxe</p>
          <p>{order.fees || 0} €</p>
        </div>
      </Column>
      <div className="column is-1 is-offset-2 has-text-right">
        <p>Total</p>
        <p>{this.props.order.investedAmount} €</p>
      </div>
      <div className="column is-1 has-text-right">
        {this._renderTag()}
      </div>
    </>;
  }

  _renderBody() {
    const order = this.props.order;
    if (order.type === OrderTypesFull[OrderType.ORDER].type
      || order.type === OrderTypesFull[OrderType.DIVIDEND].type) {
      return this._renderOrderBody();
    }
    return <>
      <Column size="is-2">
        <div>
          <p>{df(order.receivedAt, "dd/mm/yyyy - hh:MM")} •&nbsp;</p>
          <p>{order.portfolio.account.name}</p>
        </div>
      </Column>
      <div className="column is-1 is-offset-2 has-text-right">
        <p>Total</p>
        <p>{this.props.order.investedAmount} €</p>
      </div>
      <div className="column is-1 has-text-right">
        {this._renderTag()}
      </div>
    </>;
  }

  render() {
    return <div className="box slide-in is-clickable">
      <div className="columns is-flex">
        {this._renderBody()}
      </div>
    </div>;
  }

  _renderTag() {
    const order = this.props.order;
    if (order.type === OrderTypesFull[OrderType.ORDER].type) {
      return <span className={"tag is-medium is-rounded is-warning is-light"} title={OrderTypesFull[order.type].name}>
        {OrderTypesFull[order.type].name}
      </span>;
    } else if (order.type === OrderTypesFull[OrderType.DEPOSIT].type) {
      return <span className={"tag is-medium is-rounded is-warning"} title={OrderTypesFull[order.type].name}>
        {OrderTypesFull[order.type].name}
      </span>;
    } else if (order.type === OrderTypesFull[OrderType.DIVIDEND].type) {
      return <span className={"tag is-medium is-rounded is-info"} title={OrderTypesFull[order.type].name}>
        {OrderTypesFull[order.type].name}
      </span>;
    } else if (order.type === OrderTypesFull[OrderType.INTEREST].type) {
      return <span className={"tag is-medium is-rounded is-danger is-light"} title={OrderTypesFull[order.type].name}>
        {OrderTypesFull[order.type].name}
      </span>;
    } else if (order.type === OrderTypesFull[OrderType.WITHDRAW].type) {
      return <span className={"tag is-medium is-rounded is-success"} title={OrderTypesFull[order.type].name}>
        {OrderTypesFull[order.type].name}
      </span>;
    }
    return <span className={"tag is-medium is-rounded"} title={OrderTypesFull[order.type].name}>
      {OrderTypesFull[order.type].name}
    </span>;
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

OrderBlock.displayName = "OrderBlock";
OrderBlock.propTypes = {
  order: PropTypes.object.isRequired,
  stocks: PropTypes.array.isRequired,
};

module.exports = OrderBlock;
