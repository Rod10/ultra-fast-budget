const React = require("react");
const PropTypes = require("prop-types");

const AccountsTypeFull = require("../../express/constants/accountstypefull.js");
const CurrenciesFull = require("../../express/constants/currenciesfull.js");

class AccountBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  render() {
    return <div className="box slide-in is-clickable">
      <div className="columns is-flex">
        <div className="column">
          <div>
            <a style={{color: this.props.account.accountType.color}}>{this.props.account.name}</a> •&nbsp;
            <b>Solde: </b>&nbsp;
            <b>{this.props.account.balance} {CurrenciesFull[this.props.account.currency].sign}</b>&nbsp;
          </div>
        </div>
        <div className="column has-text-right">
          {this._renderTag(this.props.account)}
        </div>
      </div>
    </div>;
  }

  _renderTag(account) {
    return <span
      className={`tag ${account.accountType.tag} is-medium is-rounded`}
      title={account.accountType.name}
    >{account.accountType.name}</span>;
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

AccountBlock.displayName = "AccountBlock";
AccountBlock.propTypes = {account: PropTypes.object.isRequired};

module.exports = AccountBlock;
