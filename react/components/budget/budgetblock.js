const React = require("react");
const PropTypes = require("prop-types");

const df = require("dateformat");

const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Title = require("../bulma/title.js");

class BudetBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleExpandClick = this.handleExpandClick.bind(this);
  }

  render() {
    const {budget} = this.props;
    const totalBudget = parseFloat(budget.totalAmount) / parseFloat(budget.totalAllocatedAmount);
    const date = new Date(budget.creationDate);
    const expandedWith = this.props.homepage ? "2" : "1";
    return <div className="box slide-in is-clickable">
      <Columns className="is-flex">
        <Column className={`is-${expandedWith}`}>
          <div>
            <img src={`/icon/${this.props.budget.category.imagePath}`} style={{width: "100%"}} />
          </div>
        </Column>
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
      </Columns>
    </div>;
  }

  handleExpandClick(evt) {
    evt.preventDefault();

    this.setState(prevState => ({expanded: !prevState.expanded}));
  }
}

BudetBlock.displayName = "BudetBlock";
BudetBlock.propTypes = {
  budget: PropTypes.object.isRequired,
  homepage: PropTypes.bool,
};

BudetBlock.defaultProps = {homepage: false};

module.exports = BudetBlock;
