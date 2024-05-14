const React = require("react");
const PropTypes = require("prop-types");

const CategoryGenres = require("../../express/constants/categorygenre.js");

const {getElFromDataset} = require("../utils/html.js");
const AsyncFilteredList = require("./asyncfilteredlist.js");

const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const CategoryBlock = require("./categoryblock.js");
const CategoryModal = require("./categorymodal.js");

class CategoryList extends AsyncFilteredList {
  constructor(props) {
    super(props);

    this.s = [{key: "genre"}];
    this.searchUri = "search";

    this.base = "/settings/category/";

    this.state = {
      currentCategory: null,
      ...this.defaultState(),
      ...props.query,
    };

    this.handleOpenDetails = this.handleOpenDetails.bind(this);
    this.handleAddCategory = this.handleAddCategory.bind(this);
    this.handleRegisterModal = this.handleRegisterModal.bind(this);
  }

  handleRegisterModal(modal, fn) {
    if (modal === "category") {
      this.openCategoryModal = fn;
    }
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "categoryid");
    const categoryId = parseInt(el.dataset.categoryid, 10);
    const category = this.props.categories.rows.find(cat => cat.id === categoryId);
    this.setState({currentCategory: category});
  }

  handleAddCategory(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const el = getElFromDataset(evt, "categoryid");
    if (!el) {
      window.openCategoryModal({type: "create"});
    }
    const categoryId = parseInt(el.dataset.categoryid, 10);
    const category = this.props.categories.rows.find(cat => cat.id === categoryId);
    window.openCategoryModal({category, subCategory: true, type: "create"});
  }

  _renderFilters() {
    return <form className="filters">
      {this._renderFilterSelect(
        "genre",
        "Genre",
        Object.keys(CategoryGenres)
          .map(e => ({value: e, label: e})),
      )}
    </form>;
  }

  render() {
    const list = this.props.categories.rows.map(category => <div
      className="mb-2"
      data-categoryid={category.id}
      onClick={this.handleOpenDetails}
      key={category.id}
    >
      <CategoryBlock
        base={this.base}
        key={category.id}
        category={category}
        data-categoryid={category.id}
        currentCategory={this.state.currentCategory}
        onAddCategory={this.handleAddCategory}
      />
    </div>);

    return <div className="body-content">
      <Columns>
        <Column size={Column.Sizes.oneThird}>
          <Title size={4} className="mb-2">Mes catégories</Title>
        </Column>
      </Columns>
      <div>
        {this._renderFilters()}
      </div>
      <hr/>
      <Columns>
        <div className="column">
          <div className="content operator-scrollblock">
            {list}
          </div>
        </div>
      </Columns>
      <div className="column has-text-right">
        <Button
          className="ml-2 has-text-weight-bold"
          icon={<Icon size="small" icon="plus" />}
          onClick={this.handleAddCategory}
        />
      </div>
      <CategoryModal onRegisterModal={this.handleRegisterModal} />
    </div>;
  }
}

CategoryList.displayName = "CategoryList";
CategoryList.propTypes = {categories: PropTypes.object.isRequired};

module.exports = CategoryList;
