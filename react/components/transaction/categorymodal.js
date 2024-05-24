const React = require("react");
const PropTypes = require("prop-types");

const TransactionType = require("../../../express/constants/transactiontype.js");

const {getElFromDataset, preventDefault} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Modal = require("../modal.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Input = require("../bulma/input.js");
const Select = require("../bulma/select.js");
const Title = require("../bulma/title.js");

const {addKeyToArray} = require("../utils.js");
const Currencies = require("../../../express/constants/currencies.js");
const CurrenciesFull = require("../../../express/constants/currenciesfull.js");
const CategoryBlock = require("../categoryblock");

class CategoryModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  static newRow(key = 0) {
    return {
      key,
      amount: "",
      category: null,
      subCategory: null,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      currentCategory: null,
      alert: false,
      pending: false,
    };
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleOpenDetails = this.handleOpenDetails.bind(this);
  }

  handleConfirmClick(evt) {
    preventDefault(evt);
    const elc = getElFromDataset(evt, "categoryid");
    const elSC = getElFromDataset(evt, "subcategoryid");
    const categoryId = parseInt(elc.dataset.categoryid, 10);
    const subCategoryId = parseInt(elSC.dataset.subcategoryid, 10);
    const category = this.props.categories.rows.find(c => c.id === categoryId);
    const subCategory = category.subCategories.find(sC => sC.id === subCategoryId);
    return this.props.onConfirm(category, subCategory);
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "propname");
    const propname = el.dataset.propname;
    this.setState({[propname]: evt.target.value});
  }

  handleOpenDetails(evt) {
    const el = getElFromDataset(evt, "categoryid");
    const categoryId = parseInt(el.dataset.categoryid, 10);
    const category = this.props.categories.rows.find(cat => cat.id === categoryId);
    this.setState({currentCategory: category});
  }

  // eslint-disable-next-line class-methods-use-this
  _renderCategoryRow(row) {
    const expanded = this.props.visible && (this.state.currentCategory !== null && this.state.currentCategory.name === row.name)
      && this.state.currentCategory.subCategories.map(subCategory => <div
        className="box is-sub-category"
        key={subCategory.id}
        data-subcategoryid={subCategory.id}
        onClick={this.handleConfirmClick}
      >
        <Columns className="is-flex">
          <Column className="is-narrow">
            <div className="icon-category" style={{width: "100px"}}>
              <img src={`/icon/${subCategory.imagePath}`} />
            </div>
          </Column>
          <Column>
            <p> •&nbsp;{subCategory.name}</p>
          </Column>
        </Columns>
      </div>);

    return <div
      className="mb-2"
      data-categoryid={row.id}
      onClick={this.handleOpenDetails}
      key={row.id}
    >
      <div className="box is-clickable">
        <Columns className="is-flex">
          <Column className="is-narrow">
            <div className="icon-category" style={{width: "100px"}}>
              <img src={`/icon/${row.imagePath}`} />
            </div>
          </Column>
          <Column>
            <a> •&nbsp;{row.name}</a>
            {expanded}
          </Column>
        </Columns>
      </div>
    </div>;
  }

      /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    const categories = this.props.categories.rows.filter(c => c.genre === this.props.genre);

    const list = categories.map(row => this._renderCategoryRow(row));

    return <Modal
      visible={this.props.visible}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText="Choisir"
      onClose={this.props.onClose}
      onConfirm={this.handleConfirmClick}
      iconType="is-info"
    >
      {list}
    </Modal>;
  }

  render() {
    return <div>
      {this._renderConfirm()}
      <Modal
        visible={this.state.alert}
        type="alert"
        confirmText="Recharger la page"
        handleConfirm={CategoryModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}

CategoryModal.displayName = "CategoryModal";
CategoryModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.object.isRequired,
  genre: PropTypes.string.isRequired,
};
// CategoryModal.defaultProps = {transaction: undefined};

module.exports = CategoryModal;
