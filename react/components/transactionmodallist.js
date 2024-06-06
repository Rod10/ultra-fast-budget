const React = require("react");
const PropTypes = require("prop-types");
const df = require("dateformat");

const TransactionTypes = require("../../express/constants/transactiontype.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Title = require("./bulma/title.js");
const Modal = require("./modal.js");

class TransactionModalList extends React.Component {
  static getAmount(row) {
    if (row.data) {
      return Math.round(row.data.map(data => parseFloat(data.amount)).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      ) * 100) / 100;
    }
    return parseFloat(row.amount);
  }

  static getTotalAmount(transactions, account) {
    let total = 0;
    for (const transaction of transactions) {
      if (transaction.type === TransactionTypes.INCOME) {
        total += Math.round(transaction.data.map(data => parseFloat(data.amount)).reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        ) * 100) / 100;
      } else if (transaction.type === TransactionTypes.EXPENSE) {
        total -= Math.round(transaction.data.map(data => parseFloat(data.amount)).reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        ) * 100) / 100;
      } else if (transaction.senderId === account.id) {
        total -= parseFloat(transaction.amount);
      } else {
        total += parseFloat(transaction.amount);
      }
    }
    return total;
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
    } else if (transaction.receiverId === this.props.account.id) {
      return <span
        className="tag is-success is-light is-medium is-rounded"
        title="Virement reçu"
      >Virement reçu</span>;
    } else if (transaction.senderId === this.props.account.id) {
      return <span
        className="tag is-danger is-light is-medium is-rounded"
        title="Virement émis"
      >Virement émis</span>;
    }
  }

  render() {
    return <Modal
      visible={this.props.visible}
      type="info"
      iconType="info"
      cancelText="Annuler"
      confirmText="Valider"
      onClose={this.props.onCloseClick}
      // onConfirm={this.handleConfirmClick}
    >
      <div>
        <h4 className="title is-4">Transaction du mois de: {this.props.month}</h4>
        <div className="content transaction-scrollblock">
          {this.props.transactions.map((transaction, index) => <div
            style={{backgroundColor: "#e3e3e3", borderRadius: "10px"}}
            key={index}
          >
            <Columns>
              <Column className="has-text-left ml-3">
                <Title size={5}>{df(transaction[0].transactionDate, "dd/mm/yyyy")}</Title>
              </Column>
              <Column className="has-text-right mr-3">
                <Title size={5}>Total de la
                  journée: {TransactionModalList.getTotalAmount(transaction, this.props.account)} €</Title>
              </Column>
            </Columns>
            {transaction.map((row, i) => <div className="box slide-in is-clickable" key={i}>
              <Columns className="is-flex is-vcentered">
                <Column className="has-text-left">
                  <div className="icon-category">
                    <img
                      src={`${row.data
                        ? `/icon/${row.data[0].subCategory.imagePath}`
                        : "https://cdn-icons-png.flaticon.com/512/2879/2879357.png"}`}
                      style={{width: "15%"}}
                    />
                  </div>
                </Column>
                <Column className="has-text-right">
                  {TransactionModalList.getAmount(row, this.props.account)} € {this._renderTag(row)}
                </Column>
              </Columns>
            </div>)}
            <hr />
          </div>)}
        </div>
      </div>
    </Modal>;
  }
}

TransactionModalList.displayName = "TransactionModalList";
TransactionModalList.propTypes = {
  transactions: PropTypes.array.isRequired,
  month: PropTypes.string.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  account: PropTypes.object.isRequired,
};
TransactionModalList.defaultProps = {visible: false};

module.exports = TransactionModalList;
