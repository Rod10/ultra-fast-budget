const React = require("react");
const PropTypes = require("prop-types");

class TransactionBlock extends React.Component {
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
          </div>
        </div>
        <div className="column has-text-right">
          {/* this._renderTag(this.props.account) */}
        </div>
      </div>
    </div>;
  }

  /* _renderTag(account) {
    return <span
      className={`tag ${AccountsTypeFull[account.type].className} is-medium is-rounded`}
      title={AccountsTypeFull[account.type].label}
    >{AccountsTypeFull[account.type].label}</span>;
  }*/

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

TransactionBlock.displayName = "TransactionBlock";
TransactionBlock.propTypes = {account: PropTypes.object.isRequired};

module.exports = TransactionBlock;
