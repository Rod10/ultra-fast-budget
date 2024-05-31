const React = require("react");
const PropTypes = require("prop-types");

const df = require("dateformat");

const CurrenciesFull = require("../../../express/constants/currenciesfull.js");
const TransactionTypes = require("../../../express/constants/transactiontype.js");
const Button = require("../bulma/button.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const Column = require("../bulma/column.js");
const Columns = require("../bulma/columns.js");

class TransactionExpand extends React.Component {
  constructor(props) {
    super(props);

    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleEditClick() {
    return this.props.onClick();
  }

  _renderSubTransaction(transaction) {
    return transaction.data.map((tr, index) => <div className="box slide-in is-clickable" key={index}>
      <div className="columns is-flex">
        <div className="column is-2">
          <div className="icon-category" style={{width: "100px"}}>
            <img src={`/icon/${tr.subCategory.imagePath}`} />
          </div>
        </div>
        <div className="column">
          <b>{tr.amount} €</b>
        </div>
      </div>
    </div>);
  }

  render() {
    const {transaction} = this.props;
    const action = this._renderActionList(transaction);

    return <div className="column">
      <div className="content box account-scrollblock expand-account">
        <div className="max-height">
          <div className="has-text-right">
            <button
              className="delete is-large"
              type="button"
              title="Fermer l'onglet"
              onClick={this.props.onClose}
            />
          </div>
          <Columns>
            <Column size={Column.Sizes.half}>
              {/* eslint-disable-next-line max-len */}
              <Title size={4} className="mb-2">{df(transaction.transactionDate, "dd/mm/yyyy - hh:MM")}</Title>
            </Column>
            <Column size={Column.Sizes.half} className="has-text-right">
              <div className="mb-2">
                {this._renderTag(transaction)}
              </div>
            </Column>
          </Columns>
          <Columns>
            <Column size={Column.Sizes.half}>
              <p>
                <b>Compte:</b> {transaction.account.name}
              </p>
            </Column>
          </Columns>
          <Columns>
            <Column size={Column.Sizes.half}>
              <p>
                <b>A:</b> {transaction.to}
              </p>
            </Column>
            <Column size={Column.Sizes.half}>
              <p>
                <b>Note:</b> {transaction.other}
              </p>
            </Column>
          </Columns>
          <Columns>
            <Column size={Column.Sizes.half}>
              <p>
                <b>Total: {Math.round(transaction.data.map(tr => parseFloat(tr.amount)).reduce(
                  (accumulator, currentValue) => accumulator + currentValue,
                  0,
                ) * 100) / 100} €</b>
              </p>
            </Column>
          </Columns>
          {this._renderSubTransaction(transaction)}
          <div className="has-text-right">
            {action}
          </div>
        </div>
      </div>
    </div>;
  }

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

  _renderActionList(transaction) {
    return <div className="column is-flex is-justify-content-flex-end is-align-items-flex-end">
      <Button
        className="ml-2 has-text-weight-bold"
        type="danger"
        icon={<Icon size="small" icon="trash" />}
        // label="Éditer"
        href={`${this.props.base}${transaction.id}/delete`}
      />
      <Button
        className="ml-2 has-text-weight-bold"
        type="themed"
        icon={<Icon size="small" icon="pencil" />}
        label="Éditer"
        onClick={this.handleEditClick}
      />
    </div>;
  }
}
TransactionExpand.displayName = "TransactionExpand";
TransactionExpand.propTypes = {
  base: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  transaction: PropTypes.object.isRequired,
};
TransactionExpand.defaultProps = {onClose: undefined};

module.exports = TransactionExpand;
