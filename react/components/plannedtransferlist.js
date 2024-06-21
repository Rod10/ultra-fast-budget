const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const PlannedTransferModal = require("./plannedtransfermodal.js");
const TransferBlock = require("./transferblock.js");

class PlannedTransferList extends React.Component {
  constructor(props) {
    super(props);
    this.base = "/planned-transfer/";

    this.state = {currentTransfer: null};

    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "planned-transfer") {
      this.openPlannedTransferModal = fn;
    }
  }

  handleCloseDetails() {
    this.setState({currentTransfer: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "transferid");
    const transferId = parseInt(el.dataset.transferid, 10);
    const transfer = this.props.transfers.rows.find(acc => acc.id === transferId);
    this.setState({currentTransfer: transfer});
  }

  render() {
    const list = this.props.transfers.rows.map(transfer => <div
      className="mb-2"
      data-transferid={transfer.id}
      onClick={this.handleOpenDetails}
      key={transfer.id}
    >
      <TransferBlock
        base={this.base}
        user={this.props.user}
        key={transfer.id}
        transfer={transfer}
        expanded={this.state.currentTransfer !== null}
      />
    </div>);

    /* const expanded = this.state.currentTransfer !== null
      && <TransferExpanded
        base={this.base}
        key={this.state.currentTransfer.id}
        transfer={this.state.currentTransfer}
        onClose={this.handleCloseDetails}
        user={this.props.user}
        onClick={() => this.openPlannedTransferModal({type: this.state.currentTransfer.type, transfer: this.state.currentTransfer, categories: this.props.categories, accounts: this.props.accounts.rows})}
      />; */

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Mes virements plannifiées</Title>
        </Column>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              type="info"
              icon={<Icon size="small" icon="rotate" />}
              label="Ajouter un nouveau virement planifié"
              onClick={() => this.openPlannedTransferModal({
                accounts: this.props.accounts,
                transfer: null,
              })}
            />
          </div>
        </Column>
      </Columns>
      <Columns>
        <div className="column">
          <div className="content operator-scrollblock">
            {list}
          </div>
        </div>
        {/* expanded */}
      </Columns>
      <PlannedTransferModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}
PlannedTransferList.displayName = "PlannedTransferList";
PlannedTransferList.propTypes = {
  user: PropTypes.object.isRequired,
  transfers: PropTypes.object.isRequired,
  categories: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
};

module.exports = PlannedTransferList;
