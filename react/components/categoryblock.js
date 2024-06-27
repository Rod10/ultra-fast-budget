const React = require("react");
const PropTypes = require("prop-types");

const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const {getElFromDataset} = require("../utils/html.js");

class CategoryBlock extends React.Component {
  constructor(props) {
    super(props);

    this.handleEditSubCategory = this.handleEditSubCategory.bind(this);
  }

  handleEditSubCategory(evt) {
    evt.stopPropagation();
    const el = getElFromDataset(evt, "subcategoryid");
    const subCategoryId = parseInt(el.dataset.subcategoryid, 10);
    const subCategory = this.props.category.subCategories.find(subCat => subCat.id === subCategoryId);
    return this.props.onEditSubCategory(this.props.category, subCategory);
  }

  render() {
    const expanded = (this.props.currentCategory !== null && this.props.currentCategory.name === this.props.category.name)
      && this.props.currentCategory.subCategories.map(subCategory => <div
        className="box is-sub-category"
        key={subCategory.id}
        data-subcategoryid={subCategory.id}
      >
        <Columns className="is-flex">
          <Column className="is-narrow">
            <div className="icon-category" style={{width: "200px"}}>
              <img src={`/icon/${subCategory.imagePath}`}/>
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
                icon={<Icon size="small" icon="trash"/>}
                // label="Éditer"
                href={`${this.props.base}/sub-category/${subCategory.id}/delete`}
              />
              <Button
                className="ml-2 has-text-weight-bold"
                type="themed"
                icon={<Icon size="small" icon="pen"/>}
                // label="Éditer"
                onClick={this.handleEditSubCategory}
              />
            </div>
          </Column>
        </Columns>
      </div>);

    return <div className="box is-clickable">
      <Columns className="is-flex">
        <Column className="is-narrow">
          <div className="icon-category" style={{width: "200px"}}>
            <img src={`/icon/${this.props.category.imagePath}`}/>
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
              icon={<Icon size="small" icon="trash"/>}
              // label="Éditer"
              href={`${this.props.base}${this.props.category.id}/delete`}
            />
            <Button
              className="ml-2 has-text-weight-bold"
              type="themed"
              icon={<Icon size="small" icon="pen"/>}
              // label="Éditer"
              onClick={this.props.onEditCategory}
            />
          </div>
        </Column>
      </Columns>
      <div className="column has-text-right">
        <Button
          className="ml-2 has-text-weight-bold"
          // type="themed"
          icon={<Icon size="small" icon="plus"/>}
          // label="Éditer"
          onClick={this.props.onAddCategory}
        />
      </div>
    </div>;
  }
}

CategoryBlock.displayName = "CategoryBlock";
CategoryBlock.propTypes = {
  category: PropTypes.object.isRequired,
  onAddCategory: PropTypes.func.isRequired,
  onEditCategory: PropTypes.func.isRequired,
  onEditSubCategory: PropTypes.func.isRequired,
  currentCategory: PropTypes.object,
  base: PropTypes.string.isRequired,
};
CategoryBlock.defaultProps = {currentCategory: null};

module.exports = CategoryBlock;
