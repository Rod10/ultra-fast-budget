const React = require("react");
const PropTypes = require("prop-types");

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

    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleEditClick() {
    return this.props.onClick();
  }

  render() {
    const action = this._renderActionList(this.props.account);

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
                <b>Dernière utilisation : DD/MM/YYYY</b>
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
        type="themed"
        href={`${this.props.base}/detail/${account.id}`}
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
    </div>;
  }
}
AccountExpand.displayName = "AccountExpand";
AccountExpand.propTypes = {
  base: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};
AccountExpand.defaultProps = {onClose: undefined};

module.exports = AccountExpand;
