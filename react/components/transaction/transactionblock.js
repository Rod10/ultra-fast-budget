const React = require("react");
const PropTypes = require("prop-types");

const df = require("dateformat");
const TransactionTypes = require("../../../express/constants/transactiontype.js");

class TransactionBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  render() {
    const amount = Math.round(this.props.transaction.data.map(account => parseFloat(account.amount)).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    ) * 100) / 100;
    const expandedWith = this.props.homepage ? "2" : "1";
    return <div className="box slide-in is-clickable">
      <div className="columns is-flex">
        <div className={`column is-${expandedWith}`}>
          <div>
            <img src={`/icon/${this.props.transaction.data[0].subCategory.imagePath}`} style={{width: "100%"}} />
          </div>
        </div>
        <div className="column">
          <div>
            <p>{df(this.props.transaction.transactionDate, "dd/mm/yyyy - hh:MM")} •&nbsp;</p>
          </div>
          <div>
            <p>{this.props.transaction.account.name}</p>
          </div>
        </div>
        <div className="column has-text-right ">
          {amount} € {this._renderTag(this.props.transaction)}
        </div>
      </div>
    </div>;
  }

  // eslint-disable-next-line class-methods-use-this
  _renderTag(transaction) {
    if (transaction.type === TransactionTypes.INCOME) {
      return <span
        className="tag is-success is-medium is-rounded"
        title="Revenue"
      >Revenue</span>;
    } else if (transaction.type === TransactionTypes.EXPECTED_INCOME) {
      return <span
        className="tag is-success is-light is-medium is-rounded"
        title="Revenue planifié"
      >Revenue planifié</span>;
    } else if (transaction.type === TransactionTypes.EXPENSE) {
      return <span
        className="tag is-danger is-medium is-rounded"
        title="Dépense"
      >Dépense</span>;
    } else if (transaction.type === TransactionTypes.EXPECTED_EXPENSE) {
      return <span
        className="tag is-danger is-light is-medium is-rounded"
        title="Dépense"
      >Dépense planifié</span>;
    } else if (transaction.type === TransactionTypes.TRANSFER) {
      return <span
        className="tag is-warning is-medium is-rounded"
        title="Transfert"
      >Transfert</span>;
    } else if (transaction.type === TransactionTypes.EXPECTED_TRANSFERT) {
      return <span
        className="tag is-warning is-light is-medium is-rounded"
        title="Transfert planifié"
      >Transfert planifié</span>;
    }
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

TransactionBlock.displayName = "TransactionBlock";
TransactionBlock.propTypes = {
  transaction: PropTypes.object.isRequired,
  homepage: PropTypes.bool,
};

TransactionBlock.defaultProps = {homepage: false};

module.exports = TransactionBlock;
