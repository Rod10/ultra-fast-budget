const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const DeletionModal = require("./deletionmodal.js");
const PlannedTransferModal = require("./plannedtransfermodal.js");
const TransferBlock = require("./transferblock.js");

class PlannedTransferList extends React.Component {
  constructor(props) {
    super(props);
    this.base = "/planned-transfer/";

    this.state = {rows: this.props.transfers.rows};

    this.handleRegisterModal = this.handleRegisterModal.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "planned-transfer") {
      this.openPlannedTransferModal = fn;
    } else if (modal === "deletion") {
      this.openDeletionModal = fn;
    }
  }

  handleOpenModal(evt) {
    const el = getElFromDataset(evt, "id");
    const modal = el.dataset.modal;
    if (el.dataset.id === "new") {
      const items = {
        plannedTransfer: null,
        accounts: this.props.accounts,
      };
      return this[modal](items, "planned-transfer");
    }
    const id = parseInt(el.dataset.id, 10);
    const plannedTransfer = this.state.rows.find(transfer => transfer.id === id);
    const items = {
      plannedTransfer,
      accounts: this.props.accounts,
    };
    return this[modal](items, "planned-transfer");
  }

  updateData(rows) {
    this.setState({rows});
  }

  render() {
    const list = this.state.rows.map(transfer => {
      const deleteBtn = <a
        data-id={transfer.id}
        data-modal="openDeletionModal"
        onClick={this.handleOpenModal}
        title="Supprimer"
      >
        <span className="icon"><i className="fa fa-trash" /></span>
      </a>;

      const editBtn = <a
        data-id={transfer.id}
        data-modal="openPlannedTransferModal"
        onClick={this.handleOpenModal}
        title="Editer"
      >
        <span className="icon"><i className="fa fa-pencil" /></span>
      </a>;

      return <div
        className="mb-2"
        data-transferid={transfer.id}
        key={transfer.id}
      >
        <TransferBlock
          base={this.base}
          user={this.props.user}
          key={transfer.id}
          transfer={transfer}
          delete={deleteBtn}
          edit={editBtn}
        />
      </div>;
    });

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
              data-id="new"
              data-modal="openPlannedTransferModal"
              icon={<Icon size="small" icon="rotate" />}
              label="Ajouter un nouveau virement planifié"
              onClick={this.handleOpenModal}
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
      <DeletionModal onRegisterModal={this.handleRegisterModal} updateData={this.updateData} />
    </div>;
  }
}
PlannedTransferList.displayName = "PlannedTransferList";
PlannedTransferList.propTypes = {
  user: PropTypes.object.isRequired,
  transfers: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
};

module.exports = PlannedTransferList;
