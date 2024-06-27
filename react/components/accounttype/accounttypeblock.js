const React = require("react");
const PropTypes = require("prop-types");

class AccountTypeBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  render() {
    return <div className="box slide-in is-clickable">
      <div className="columns is-flex">
        <div className="column">
          <div>
            <a>{this.props.accountType.name}</a> •&nbsp;
            <b>Montant maximal du compte: </b>&nbsp;
            <b>{this.props.accountType.maxAmount} €</b>&nbsp;
          </div>
        </div>
        <div className="column">
          <b>Interêt du compte: </b>
          <p>{this.props.accountType.interest}%</p>
        </div>
        <div className="column has-text-right">
          {this._renderTag(this.props.accountType)}
        </div>
      </div>
    </div>;
  }

  // eslint-disable-next-line class-methods-use-this
  _renderTag(accountType) {
    return <span
      className={`tag ${accountType.className} is-medium is-rounded`}
      title={accountType.name}
    >{accountType.name}</span>;
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

AccountTypeBlock.displayName = "AccountTypeBlock";
AccountTypeBlock.propTypes = {accountType: PropTypes.object.isRequired};

module.exports = AccountTypeBlock;
