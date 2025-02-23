const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

const df = require("dateformat");

const CurrenciesFull = require("../../express/constants/currenciesfull.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Column = require("./bulma/column.js");
const Columns = require("./bulma/columns.js");

class AccountExpand extends React.Component {
  constructor(props) {
    super(props);
    this.charts = {};
    if (this.props.graphs) {
      const graph = this.props.graphs[this.props.account.accountType.type];
      this.charts[graph.label] = React.createRef();
    }
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  componentDidMount() {
    Chart.register(CategoryScale);
    Chart.register(LinearScale);
    Chart.register(BarController);
    Chart.register(BarElement);
    Chart.register(...registerables);

    if (this.props.graphs) {
      const graph = this.props.graphs[this.props.account.accountType.type];
      if (graph.type === "pie") {
        this.createPieChart(graph, this.charts[graph.label].current.getContext("2d"));
      } else {
        this.createLineChart(graph, this.charts[graph.label].current.getContext("2d"));
      }
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

  createLineChart(graph, chart) {
    this.context = chart;
    const {type, data, options} = graph;
    new Chart(this.context.canvas, {
      type,
      data,
      options,
    });
  }

  handleEditClick() {
    return this.props.onClick();
  }

  render() {
    const action = this._renderActionList(this.props.account);
    const graph = this.props.graphs[this.props.account.accountType.type];
    return <div className="column">
      <div className="content box account-scrollblock expand-account">
        <div className="max-height">
          <div className="has-text-right">
            <button
              className="delete is-large"
              type="button"
              title="Fermer l'onglet"
              onClick={this.props.onClose}
            />
          </div>
          <div>
            {/* eslint-disable-next-line max-len */}
            <Title size={4} className="mb-2">{this.props.account.name}</Title>
            <div className="mb-2">
              {this._renderTag(this.props.account)}
            </div>
          </div>
          <Columns>
            <Column size={Column.Sizes.half}>
              <p>
                <b>Solde : {this.props.account.balance} {CurrenciesFull[this.props.account.currency].sign}</b>
                <br />
              </p>
              <p>
                <b>Dernière utilisation : {df(this.props.account.modificationDate, "paddedShortDate")}</b>
                <br />
              </p>
            </Column>
            <Column size={Column.Sizes.half}>
              <p>
                <b>Solde Initial: {this.props.account.initialBalance} {CurrenciesFull[this.props.account.currency].sign}</b>
                <br />
              </p>
              <p>
                <b>Date de création: {df(this.props.account.creationDate, "paddedShortDate")}</b>
                <br />
              </p>
            </Column>
          </Columns>
          <div className="has-text-centered">
            <Button
              className="ml-2 has-text-weight-bold"
              type="themed"
              label="Mois"
            />
            <Button
              className="ml-2 has-text-weight-bold"
              type="themed"
              label="Semaine"
            />
            <Button
              className="ml-2 has-text-weight-bold"
              type="themed"
              label="Jours"
            />
          </div>
          <br />
          <Columns>
            <Column>
              <div className="is-flex graph-container">
                {this.props.graphs && <div
                  key={graph}
                  className={`is-${graph.column} is-flex-grow-${graph.column}`}
                >
                  <div className="pr-2 pb-2">
                    <div className={"graph-box"}>
                      <Title size={5}>{graph.label}</Title>
                      <div className="is-relative">
                        <canvas id="chart" ref={this.charts[graph.label]} />
                      </div>
                    </div>
                  </div>
                </div>}
              </div>
            </Column>
          </Columns>
          <div className="has-text-right">
            {action}
          </div>
        </div>
      </div>
    </div>;
  }

  _renderTag(account) {
    /* if (account.transferedToSocietyId === this.props.society.id) {
      return <span
        className="tag is-link is-medium is-rounded"
        title="L'opérateur a été transféré par une autre entité"
      >Reçu</span>;
    }
    if (account.transferedToSocietyId) {
      return <span
        className="tag is-warning is-medium is-rounded"
        title="L'opérateur a été transféré dans une autre entité, il ne peut pas être utilisé dans les opérations"
      > Prêté</span>;
    }
    if (this.props.hasLeaved === "true") {
      return <span
        className="tag is-info is-medium is-rounded"
        title="A quitté l'entreprise"
      >A quitté l'entreprise</span>;
    }
    if (account.state === ContributorStates.CREATED) {
      return <span
        className="tag is-info is-medium is-rounded"
        title="L'opérateur ne peut pas être utilisé dans les opérations, il doit valider le compte via le mail reçu"
      >{contributorStates.CREATED}</span>;
    }
    if (account.state === ContributorStates.INACTIVE) {
      return <span
        className="tag is-light is-medium is-rounded"
        title="L'opérateur a été explicitement désactivé il ne peut pas être utilisé dans les opérations."
      >{contributorStates.INACTIVE}</span>;
    }
    return <span
      className="tag is-success is-medium is-rounded"
      title="L'opérateur est actif est peut être utilisé dans les opérations."
    >{contributorStates.ACTIVE}</span>;*/
  }

  _renderActionList(account) {
    return <div className="column is-flex is-justify-content-flex-end is-align-items-flex-end">
      {/* TODO: View details */}
      <Button
        className="ml-2 has-text-weight-bold"
        type="info"
        icon={<Icon size="small" icon="rotate" />}
        label="Effectuer un virement"
        onClick={this.props.openTransferModal}
      />
      <Button
        className="ml-2 has-text-weight-bold"
        type="themed"
        href={`${this.props.base}/details/${account.id}`}
        icon={<Icon size="small" icon="eye" />}
        label="Détail"
      />
      <Button
        className="ml-2 has-text-weight-bold"
        type="themed"
        icon={<Icon size="small" icon="pencil" />}
        label="Éditer"
        onClick={this.handleEditClick}
      />
      <Button
        className="ml-2 has-text-weight-bold"
        type="danger"
        icon={<Icon size="small" icon="trash" />}
        label="Supprimer"
        onClick={this.props.onDeleteClick}
      />
    </div>;
  }
}
AccountExpand.displayName = "AccountExpand";
AccountExpand.propTypes = {
  base: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  graphs: PropTypes.object.isRequired,
  openTransferModal: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
};
AccountExpand.defaultProps = {onClose: undefined};

module.exports = AccountExpand;
