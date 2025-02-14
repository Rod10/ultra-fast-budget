const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");

const utils = require("../utils.js");
const DeletionModal = require("../deletionmodal.js");
const AccountBlock = require("./accounttypeblock.js");
const AccountTypeModal = require("./accounttypemodal.js");

class AccountTypeList extends React.Component {
  constructor(props) {
    super(props);
    this.base = `/account-type/${this.props.user.id}`;

    this.state = {rows: this.props.accountTypes.rows};

    this.handleRegisterModal = this.handleRegisterModal.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "account-type") {
      this.openAccountTypeModal = fn;
    } else if (modal === "deletion") {
      this.openDeletionModal = fn;
    }
  }

  handleOpenModal(evt) {
    const el = getElFromDataset(evt, "id");
    const modal = el.dataset.modal;
    if (el.dataset.id === "new") {
      return this[modal](null, "accountType");
    }
    const id = parseInt(el.dataset.id, 10);
    const accountType = this.state.rows.find(row => row.id === id);
    return this[modal](accountType, "accountType");
  }

  updateData(rows) {
    this.setState({rows});
  }

  _renderAccountTypeRow(id, accountType) {
    const deleteBtn = <a
      data-id={id}
      data-modal="openDeletionModal"
      onClick={this.handleOpenModal}
      title="Supprimer"
    >
      <span className="icon"><i className="fa fa-trash" /></span>
    </a>;

    const editBtn = <a
      data-id={id}
      data-modal="openAccountTypeModal"
      onClick={this.handleOpenModal}
      title="Editer"
    >
      <span className="icon"><i className="fa fa-pencil" /></span>
    </a>;

    return <div
      className="mb-2"
      key={accountType.id}
    >
      <AccountBlock
        base={this.base}
        key={accountType.id}
        accountType={accountType}
        delete={deleteBtn}
        edit={editBtn}
      />
    </div>;
  }

  render() {
    const list = this.state.rows.map(e => this._renderAccountTypeRow(e.id, e));
    return <div className="body-content">
      <Columns>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              data-id="new"
              data-modal="openAccountTypeModal"
              type="themed"
              icon={<Icon size="small" icon="plus" />}
              label="Ajouter un Type de compte"
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
      </Columns>
      <AccountTypeModal onRegisterModal={this.handleRegisterModal} />
      <DeletionModal onRegisterModal={this.handleRegisterModal} updateData={this.updateData} />
    </div>;
  }
}
AccountTypeList.displayName = "AccountTypeList";
AccountTypeList.propTypes = {
  user: PropTypes.object.isRequired,
  accountTypes: PropTypes.object.isRequired,
};

module.exports = AccountTypeList;
