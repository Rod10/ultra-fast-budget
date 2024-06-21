const React = require("react");
const PropTypes = require("prop-types");

const df = require("dateformat");

const Button = require("../bulma/button.js");
const Icon = require("../bulma/icon.js");
const Title = require("../bulma/title.js");
const Column = require("../bulma/column.js");
const Columns = require("../bulma/columns.js");

class BudgetExpand extends React.Component {
  constructor(props) {
    super(props);

    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleEditClick() {
    return this.props.onClick();
  }

  _renderSubTransaction(budget) {
    return budget.data.map((tr, index) => <div className="box" key={index}>
      <div className="columns is-flex">
        <div className="column is-2">
          <div className="icon-category" style={{width: "100px"}}>
            <img src={`/icon/${tr.subCategory.imagePath}`} />
          </div>
        </div>
        <Column>
          <progress value={parseFloat(tr.amount) / parseFloat(tr.totalAmount)} style={{width: "100%"}} />
          <Columns>
            <Column className="has-text-left">
              <p>0 €</p>
            </Column>
            <Column className="has-text-centered">
              <p>{tr.amount} €</p>
            </Column>
            <Column className="has-text-right">
              <p>{tr.totalAmount} €</p>
            </Column>
          </Columns>
        </Column>
      </div>
    </div>);
  }

  render() {
    const {budget} = this.props;
    const action = this._renderActionList(budget);
    const date = new Date();

    const totalBudget = parseFloat(budget.totalAmount) / parseFloat(budget.totalAllocatedAmount);

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
          <Columns>
            <Column>
              {/* eslint-disable-next-line max-len */}
              <Title size={4} className="mb-2">{budget.name}</Title>
            </Column>
          </Columns>
          <Column>
            <Columns>
              <Column className="has-text-left">
                <p>{df(new Date(date.getFullYear(), date.getMonth(), 1), "dd/mm/yyyy")}</p>
              </Column>
              <Column className="has-text-right">
                <p>{df(new Date(date.getFullYear(), date.getMonth() + 1, 0), "dd/mm/yyyy")}</p>
              </Column>
            </Columns>
            <progress value={totalBudget} style={{width: "100%"}} />
            <Columns>
              <Column className="has-text-left">
                <p>0 €</p>
              </Column>
              <Column className="has-text-centered">
                <p>{budget.totalAmount} €</p>
              </Column>
              <Column className="has-text-right">
                <p>{budget.totalAllocatedAmount} €</p>
              </Column>
            </Columns>
          </Column>
          {this._renderSubTransaction(budget)}
          <div className="has-text-right">
            {action}
          </div>
        </div>
      </div>
    </div>;
  }

  _renderActionList(budget) {
    return <div className="column is-flex is-justify-content-flex-end is-align-items-flex-end">
      <Button
        className="ml-2 has-text-weight-bold"
        type="danger"
        icon={<Icon size="small" icon="trash" />}
        href={`${this.props.base}${budget.id}/delete`}
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
BudgetExpand.displayName = "BudgetExpand";
BudgetExpand.propTypes = {
  // eslint-disable-next-line linebreak-style
  base: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  budget: PropTypes.object.isRequired,
};
BudgetExpand.defaultProps = {onClose: undefined};

module.exports = BudgetExpand;
