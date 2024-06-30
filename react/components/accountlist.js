const React = require("react");
const PropTypes = require("prop-types");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const AccountModal = require("./accountmodal.js");
const AccountBlock = require("./accountblock.js");
const AccountExpand = require("./accountexpand.js");
const TransferModal = require("./transfermodal.js");

const utils = require("./utils.js");

class AccountList extends React.Component {
  constructor(props) {
    super(props);
    this.base = `/account/${this.props.user.id}`;

    this.state = {
      modal: "",
      currentAccount: null,
    };

    this.handleOpenAccountModal = this.handleOpenAccountModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleCloseDetails = this.handleCloseDetails.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "account") {
      this.openAccountModal = fn;
    } else if (modal === "transfer") {
      this.openTransferModal = fn;
    }
  }

  handleOpenAccountModal() {
    this.setState({modal: "account"});
  }

  handleCloseModal() {
    this.setState({modal: null});
  }

  handleCloseDetails() {
    this.setState({currentAccount: null});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "accountid");
    const accountId = parseInt(el.dataset.accountid, 10);
    const account = this.props.userAccounts.rows.find(acc => acc.id === accountId);
    this.setState({currentAccount: account});
  }

  render() {
    const totalAmount = this.props.userAccounts.rows.map(account => account.balance).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const list = this.props.userAccounts.rows.map(account => <div
      className="mb-2"
      data-accountid={account.id}
      onClick={this.handleOpenDetails}
      key={account.id}
    >
      <AccountBlock
        base={this.base}
        key={account.id}
        account={account}
      />
    </div>);

    const expanded = this.state.currentAccount !== null
        && <AccountExpand
          base={this.base}
          key={this.state.currentAccount.id}
          account={this.state.currentAccount}
          onClose={this.handleCloseDetails}
          onClick={() => this.openAccountModal(this.state.currentAccount, this.props.accountsType)}
          openTransferModal={() => this.openTransferModal({
            currentAccount: this.state.currentAccount,
            accounts: this.props.userAccounts,
            transfer: null,
          }, this.props.accountsType)}
          graphs={this.props.graphs}
          userAccounts={this.props.userAccounts}
        />;

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Mes Comptes</Title>
          <Title size={6} className="mb-2">Total: {totalAmount}€</Title>
        </Column>
        <Column>
          <div className="has-text-right">
            <Button
              className="has-text-weight-bold mr-3"
              type="themed"
              icon={<Icon size="small" icon="list" />}
              label="Voir les transfers planifiés"
              href="/planned-transfer/list"
            />
            <Button
              className="has-text-weight-bold mr-3"
              type="themed"
              icon={<Icon size="small" icon="plus" />}
              label="Ajouter un compte"
              onClick={() => this.openAccountModal(null, this.props.accountsType)}
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
      <AccountModal onRegisterModal={this.handleRegisterModal} />
      <TransferModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}
AccountList.displayName = "AccountList";
AccountList.propTypes = {
  user: PropTypes.object.isRequired,
  userAccounts: PropTypes.object.isRequired,
  accountsType: PropTypes.object.isRequired,
  graphs: PropTypes.object,
};
AccountList.defaultProps = {graphs: undefined};

module.exports = AccountList;
