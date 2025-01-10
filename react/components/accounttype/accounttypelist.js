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

    this.state = {};

    this.handleRegisterModal = this.handleRegisterModal.bind(this);
    this.handleOpenDeletionModal = this.handleOpenDeletionModal.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "account-type") {
      this.openAccountTypeModal = fn;
    } else if (modal === "deletion") {
      this.openDeletionModal = fn;
    }
  }

  handleOpenDeletionModal(evt) {
    const el = getElFromDataset(evt, "id");
    const id = parseInt(el.dataset.id, 10);
    const accountType = this.props.accountTypes.rows.find(row => row.id === id);
    return this.openDeletionModal(accountType, `/settings/preferences/account-type/${id}`);
  }

  _renderAccountTypeRow(id, accountType) {
    const deleteBtn = <a
      data-id={id}
      onClick={this.handleOpenDeletionModal}
      title="Supprimer"
    >
      <span className="icon"><i className="fa fa-trash" /></span>
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
      />
    </div>;
  }

  render() {
    const list = this.props.accountTypes.rows.map(e => this._renderAccountTypeRow(e.id, e));
    /* const list = this.props.accountTypes.rows.map(accountType => <div
      className="mb-2"
      key={accountType.id}
    >
      <AccountBlock
        base={this.base}
        key={accountType.id}
        accountType={accountType}
        delete={deleteBtn}
      />
    </div>);*/

    return <div className="body-content">
      <Columns>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              type="themed"
              icon={<Icon size="small" icon="plus" />}
              label="Ajouter un Type de compte"
              onClick={() => this.openAccountTypeModal()}
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
      <DeletionModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}
AccountTypeList.displayName = "AccountTypeList";
AccountTypeList.propTypes = {
  user: PropTypes.object.isRequired,
  accountTypes: PropTypes.object.isRequired,
  graphs: PropTypes.object,
};
AccountTypeList.defaultProps = {graphs: undefined};

module.exports = AccountTypeList;
