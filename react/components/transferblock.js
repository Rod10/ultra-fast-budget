const React = require("react");
const PropTypes = require("prop-types");
const df = require("dateformat");
const Column = require("./bulma/column.js");
const Columns = require("./bulma/columns.js");
const Icon = require("./bulma/icon.js");

class TransferBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  render() {
    return <div className="box slide-in is-clickable">
      <div className="columns is-flex">
        <Column>
          {df(this.props.transfer.transferDate, "dd/mm/yyyy")} •&nbsp;
          <b>{this.props.transfer.sender.name}</b>
          <Icon size="medium" icon="arrow-right" />
          <b>{this.props.transfer.receiver.name}</b>
        </Column>
        <Column>
          {this.props.transfer.other}
        </Column>
        <Column className="has-text-right">
          <b>{this.props.transfer.amount} €</b> {this._renderTag()}
          {this.props.edit ? this.props.edit : null}
          {this.props.delete ? this.props.delete : null}
        </Column>
      </div>
    </div>;
  }

  _renderTag() {
    return <span
      className={"tag is-info is-medium is-rounded"}
      title="Virement plannifié"
    >Virement plannifié</span>;
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

TransferBlock.displayName = "TransferBlock";
TransferBlock.propTypes = {
  transfer: PropTypes.object.isRequired,
  delete: PropTypes.object.isRequired,
  edit: PropTypes.object.isRequired,
};

module.exports = TransferBlock;
