const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const AccountModal = require("./accountmodal.js");
const AccountBlock = require("./accountblock.js");
const AccountExpand = require("./accountexpand.js");

const utils = require("./utils.js");

class AccountList extends React.Component {
  constructor(props) {
    super(props);
    this.base = `/account/${this.props.user.id}`;
    this.charts = [];
    if (this.props.graphs) {
      this.props.graphs.forEach(graph => {
        this.charts[graph.label] = React.createRef();
      });
    }

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

  componentDidMount() {
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(BarController);
    Chart.register(BarElement);
    Chart.register(...registerables);

    if (this.props.graphs) {
      this.props.graphs.forEach(graph => {
        if (graph.type === "pie") {
          this.createPieChart(graph, this.charts[graph.label].current.getContext("2d"));
        } else {
          this.createLineChart(graph, this.charts[graph.label].current.getContext("2d"));
        }
      });
    }
  }

  createPieChart(graph, chart) {
    this.context = chart;
    const {label, labels, backgroundColor} = graph;
    const data = {
      labels,
      datasets: [{
        label,
        data: graph.data,
        backgroundColor,
        hoverOffset: 4,
      }],
    };
    new Chart(this.context.canvas, {
      type: "pie",
      data,
      options: {responsive: true},
    });
  }

  handleRegisterModal(modal, fn) {
    if (modal === "account") {
      this.openAccountModal = fn;
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
    const account = this.props.userAccount.rows.find(acc => acc.id === accountId);
    this.setState({currentAccount: account});
  }

  render() {
    const totalAmount = this.props.userAccount.rows.map(account => account.balance).reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const list = this.props.userAccount.rows.map(account => <div
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
          onClick={() => this.openAccountModal(this.state.currentAccount)}
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
              icon={<Icon size="small" icon="plus" />}
              label="Ajouter un compte"
              // onClick={this.handleOpenAccountModal}
              onClick={() => this.openAccountModal({account: {}})}
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
    </div>;
  }
}
AccountList.displayName = "AccountList";
AccountList.propTypes = {
  user: PropTypes.object.isRequired,
  userAccount: PropTypes.object.isRequired,
  graphs: PropTypes.array,
};
AccountList.defaultProps = {graphs: undefined};

module.exports = AccountList;
