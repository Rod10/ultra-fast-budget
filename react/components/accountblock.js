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
            <a>{this.props.account.name}</a> •&nbsp;
            <b>Solde: </b>&nbsp;
            <b>{this.props.account.balance} {CurrenciesFull[this.props.account.currency].sign}</b>&nbsp;
          </div>
        </div>
        <div className="column has-text-right">
          {this._renderTag()}
        </div>
      </div>
    </div>;
  }

  _renderTag() {
    return <span
      className={`tag ${this.props.account.className} is-medium is-rounded`}
      title={AccountsTypeFull[this.props.account.type].label}
    >{this.props.account.type}</span>;
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

AccountBlock.displayName = "AccountBlock";
AccountBlock.propTypes = {account: PropTypes.object.isRequired};

module.exports = AccountBlock;
