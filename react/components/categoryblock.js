const React = require("react");
const PropTypes = require("prop-types");

const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Button = require("./bulma/button");
const Icon = require("./bulma/icon");

class CategoryBlock extends React.Component {
  render() {
    const expanded = (this.props.currentCategory !== null && this.props.currentCategory.name === this.props.category.name)
      && this.props.currentCategory.subCategories.map(subCategory => <div
        className="box is-sub-category"
        key={subCategory.id}
      >
        <Columns className="is-flex">
          <Column className="is-narrow">
            <div className="icon-category" style={{width: "200px"}}>
              <img src={subCategory.imagePath} />
            </div>
          </Column>
          <Column>
            <p> •&nbsp;{subCategory.name}</p>
          </Column>
          <Column className="is-narrow">
            <div>
              <Button
                className="ml-2 has-text-weight-bold"
                type="danger"
                icon={<Icon size="small" icon="trash" />}
                // label="Éditer"
                // onClick={this.handleEditClick}
              />
              <Button
                className="ml-2 has-text-weight-bold"
                type="themed"
                icon={<Icon size="small" icon="pen" />}
                // label="Éditer"
                // onClick={this.handleEditClick}
              />
            </div>
          </Column>
        </Columns>
      </div>);

    return <div className="box is-clickable">
      <Columns className="is-flex">
        <Column className="is-narrow">
          <div className="icon-category" style={{width: "200px"}}>
            <img src={this.props.category.imagePath} />
          </div>
        </Column>
        <Column>
          <a> •&nbsp;{this.props.category.name}</a>
          {expanded}
        </Column>
        <Column className="is-narrow">
          <div>
            <Button
              className="ml-2 has-text-weight-bold"
              type="danger"
              icon={<Icon size="small" icon="trash" />}
              // label="Éditer"
              // onClick={this.handleEditClick}
            />
            <Button
              className="ml-2 has-text-weight-bold"
              type="themed"
              icon={<Icon size="small" icon="pen" />}
              // label="Éditer"
              // onClick={this.handleEditClick}
            />
          </div>
        </Column>
      </Columns>
      <div className="column has-text-right">
        <Button
          className="ml-2 has-text-weight-bold"
          // type="themed"
          icon={<Icon size="small" icon="plus" />}
          // label="Éditer"
          onClick={this.props.onAddCategory}
        />
      </div>
    </div>;
  }

  _renderTag() {
   /* return <span
      className={`tag ${this.props.category.className} is-medium is-rounded`}
      title={AccountsTypeFull[this.props.category.type].label}
    >{this.props.category.type}</span>;*/
  }
}

CategoryBlock.displayName = "CategoryBlock";
CategoryBlock.propTypes = {
  category: PropTypes.object.isRequired,
  onAddCategory: PropTypes.func.isRequired,
  currentCategory: PropTypes.object,
};
CategoryBlock.defaultProps = {currentCategory: null};

module.exports = CategoryBlock;
