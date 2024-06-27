const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");

const utils = require("../utils.js");
const AccountBlock = require("./accounttypeblock.js");
const AccountTypeModal = require("./accounttypemodal.js");

class AccountTypeList extends React.Component {
  constructor(props) {
    super(props);
    this.base = `/account-type/${this.props.user.id}`;

    this.state = {
      modal: "",
      currentAccountType: null,
    };

    this.handleOpenAccountModal = this.handleOpenAccountModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "account-type") {
      this.openAccountTypeModal = fn;
    }
  }

  handleOpenAccountModal() {
    this.setState({modal: "accountType"});
  }

  handleCloseModal() {
    this.setState({modal: null});
  }

  handleCloseDetails() {
    this.setState({currentAccountType: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "accountTypeid");
    const accountTypeId = parseInt(el.dataset.accountTypeid, 10);
    const accountType = this.props.accountTypes.rows.find(acc => acc.id === accountTypeId);
    this.setState({currentAccountType: accountType});
  }

  render() {
    const list = this.props.accountTypes.rows.map(accountType => <div
      className="mb-2"
      data-accountTypeid={accountType.id}
      onClick={this.handleOpenDetails}
      key={accountType.id}
    >
      <AccountBlock
        base={this.base}
        key={accountType.id}
        accountType={accountType}
      />
    </div>);

    const expanded = null;

    /* const expanded = this.state.currentAccountType !== null
      && <AccountExpand
        base={this.base}
        key={this.state.currentAccountType.id}
        accountType={this.state.currentAccountType}
        onClose={this.handleCloseDetails}
        onClick={() => this.openAccountTypeModal(this.state.currentAccountType)}
        accountTypes={this.props.accountTypes}
      />;*/

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird} />
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
        {expanded}
      </Columns>
      <AccountTypeModal onRegisterModal={this.handleRegisterModal} />
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
