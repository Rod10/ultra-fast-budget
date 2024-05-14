const React = require("react");
const PropTypes = require("prop-types");

const CategoriesGenre = require("../../express/constants/categorygenre.js");

const {getElFromDataset} = require("../utils/html.js");
const Button = require("./bulma/button.js");
const Modal = require("./modal.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");
const Icon = require("./bulma/icon.js");
const Input = require("./bulma/input.js");
const Select = require("./bulma/select.js");
const Title = require("./bulma/title.js");
const FileInput = require("./fileinput.js");

class CategoryModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  constructor(props) {
    super(props);

    this.state = {
      type: "",
      category: {},
      newCategory: {},
      subCategory: false,
      // eslint-disable-next-line camelcase
      old_icon: null,
      icon: null,
      visible: false,
      alert: false,
      pending: false,
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleImageFileChange = this.handleImageFileChange.bind(this);
    this.categoryFormRef = React.createRef();
  }

  componentDidMount() {
    window.openCategoryModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("mail", this.openModal);
    }
  }

  openModal(item) {
    this.setState(() => ({
      visible: true,
      category: item.category,
      subCategory: item.subCategory,
      type: item.type,
      old_icon: item ? item.icon : null,
      icon: item ? item.icon : null,
    }));
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "key");
    const key = el.dataset.key;
    this.setState(prevState => {
      const newState = {...prevState};
      newState.newCategory[key] = evt.target.value;
      return newState;
    });
  }

  handleConfirmClick() {
    if (this.state.pending) return;

    if (this.categoryFormRef.current.reportValidity()) {
      this.setState(({pending: true}), () => {
        this.categoryFormRef.current.submit();
      });
    }
  }

  handleClose() {
    this.setState({
      visible: false,
      category: undefined,
      newCategory: {},
    });
  }

  handleImageFileChange(evt) {
    if (evt.target.files.length) {
      /* eslint-disable-next-line camelcase */
      this.setState({icon: evt.target.files[0]});
    }
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    // if (!this.state.confirm) return null;
    const category = this.state.category;
    const newCategory = this.state.newCategory;
    let action = null;
    let title = null;
    if (this.state.type === "create") {
      /* if category then it's for creating a new sub-category */
      if (category) {
        action = `/settings/category/${category.id}/create-sub-category`;
        title = "Créer une sous-catégorie";
      } else {
        action = "/settings/category/new";
        title = "Créer une catégorie";
      }
    }

    const genreName = {
      INCOME: "Revenue",
      OUTCOME: "Dépense",
    };

    const categoriesGenre = Object.keys(CategoriesGenre).map(genre => ({
      value: genre,
      label: genreName[genre],
    }));

    return <Modal
      visible={this.state.visible}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText="Créer"
      onClose={this.handleClose}
      onConfirm={this.handleConfirmClick}
      iconType="is-info"
    >
      <form
        ref={this.categoryFormRef}
        method="POST"
        action={action}
        encType="multipart/form-data"
      >
        <Columns>
          <Column>
            <Title size={4} className="mb-2">{title}</Title>
          </Column>
        </Columns>
        <div>
          <div className="field">
            <label className="label">Icon de la catégorie :</label>
            <div className="control">
              <FileInput
                name="icon"
                label="Glisser l'image de la catégorie'"
                doc={this.state.icon}
                // accept={ValidFileTypes}
                handleFileChange={this.handleImageFileChange}
              />
              <input
                type="hidden"
                name="old_icon"
                defaultValue={this.state.old_icon
                  ? this.state.old_icon.id
                  : 0}
              />
              {this.state.old_icon && <div className="level">
                <div className="level-left">
                  <a
                    href={`${this.state.old_icon.path}`}
                    target="_blank"
                    rel="noreferrer"
                  > Voir l'image </a>
                </div>
              </div>}
            </div>
          </div>
          <Input
            className="input"
            label="Nom"
            type="text"
            name="name"
            value={newCategory ? newCategory.name : ""}
            data-key={"name"}
            onChange={this.handleChange}
            horizontal
          />
          <Input
            className="input"
            label="Type"
            type="text"
            name="type"
            value={newCategory ? newCategory.type : ""}
            data-key={"type"}
            onChange={this.handleChange}
            horizontal
          />
          <Select
            label="Genre"
            type="text"
            name="genre"
            defaultValue={newCategory ? newCategory.genre : ""}
            options={categoriesGenre}
          />
        </div>
        {/* <Columns>
          <Column>
            <Input
              className="input"
              label="Nom"
              type="text"
              name="name"
              value={this.state.name}
              data-key={"name"}
              onChange={this.handleChange}
              horizontal
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Select
              label="Type"
              type="text"
              name="type"
              defaultValue={this.state.type}
              options={typeOptions}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              label="Montant initial"
              type="text"
              name="initialBalance"
              defaultValue={this.state.initialBalance}
              horizontal
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Select
              label="Devise"
              type="text"
              name="currency"
              defaultValue={this.state.currency}
              options={currenciesOptions}
            />
          </Column>
        </Columns>*/}
      </form>
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
CategoryModal.propTypes = {onRegisterModal: PropTypes.func.isRequired};
// CategoryModal.defaultProps = {account: undefined};

module.exports = CategoryModal;
