const React = require("react");
const PropTypes = require("prop-types");
const dateFns = require("date-fns");

const {getElFromDataset, preventDefault} = require("../../utils/html.js");
const Button = require("../bulma/button.js");
const Modal = require("../modal.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Input = require("../bulma/input.js");
const Select = require("../bulma/select.js");
const Title = require("../bulma/title.js");
const DatePicker = require("../datepicker.js");

const {addKeyToArray} = require("../utils.js");

const CategoryModal = require("../transaction/categorymodal.js");

class BudgetCreationModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  static newRow(key = 0) {
    return {
      key,
      amount: "",
      subCategory: null,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      id: null,
      categories: {rows: []},
      data: [],
      date: "",
      account: "",
      notes: "",
      to: "",
      dataLastKey: 0,
      currentKey: 0,
      currentList: 0,
      accounts: [],
      visible: false,
      alert: false,
      pending: false,
    };

    this.openModal = this.openModal.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleRowToData = this.handleRowToData.bind(this);
    this.handleOpenCategoryModal = this.handleOpenCategoryModal.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleRemoveFromList = this.handleRemoveFromList.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.budgetFormRef = React.createRef();
  }

  componentDidMount() {
    window.openBudgetCreationModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("budget-creation", this.openModal);
    }
  }

  openModal(items) {
    this.setState(() => {
      const data = items.budget
        ? addKeyToArray(items.budget.data)
        : [BudgetCreationModal.newRow()];
      const date = items.budget ? new Date(items.budget.budgetDate)
        : new Date();
      const id = items.budget ? items.budget.id : 0;
      const duration = items.budget ? items.budget.duration : 0;
      const unit = items.budget ? items.budget.unit : "month";
      const category = items.budget ? items.budget.category : null;
      return {
        id,
        category,
        budget: items.budget,
        visible: true,
        data,
        date,
        unit,
        duration,
        accounts: items.accounts,
        dataLastKey: data.length - 1,
        categories: items.categories,
      };
    });
  }

  handleChange(evt) {
    const el = getElFromDataset(evt, "propname");
    const key = el.dataset.propname;
    this.setState({[key]: evt.target.value});
  }

  handleConfirmClick(evt) {
    preventDefault(evt);
    if (this.state.pending) return;

    if (this.budgetFormRef.current.reportValidity()) {
      this.setState(({pending: true}), () => {
        this.budgetFormRef.current.submit();
      });
    }
  }

  handleClose() {
    this.setState({visible: false});
  }

  handleCloseModal() {
    this.setState({modal: null});
  }

  handleListChange(evt) {
    preventDefault(evt);
    const el = evt.target;
    const list = el.dataset.list;
    const key = parseInt(el.dataset.key, 10);
    const propName = el.dataset.propname;
    this.setState(prevState => ({
      [list]: prevState[list].map(entry => {
        if (entry.key === key) {
          return {
            ...entry,
            [propName]: evt.target.value,
          };
        }
        return entry;
      }),
    }));
  }

  handleRowToData(evt) {
    preventDefault(evt);
    this.setState(prevState => ({
      dataLastKey: prevState["dataLastKey"] + 1,
      data: prevState.data.concat(BudgetCreationModal.newRow(prevState["dataLastKey"] + 1)),
    }));
  }

  handleOpenCategoryModal(evt) {
    preventDefault(evt);
    const el = getElFromDataset(evt, "list");
    if (!el) {
      this.setState({modal: "category", currentKey: null, currentList: null});
    }
    const key = parseInt(el.dataset.key, 10);
    const currentList = el.dataset.list;
    this.setState({modal: "category", currentKey: key, currentList});
  }

  handleCategoryChange(category, subCategory) {
    this.setState(prevState => {
      if (prevState.currentList) {
        return {
          data: prevState["data"].map(entry => {
            if (entry.key === prevState.currentKey) {
              return {
                ...entry,
                subCategory,
              };
            }
            return entry;
          }),
          modal: null,
        };
      }
      return {category, modal: null};
    });
  }

  handleRemoveFromList(evt) {
    this.setState(prevState => {
      let el = evt.target;
      while (!el.dataset.btn) {
        el = el.parentNode;
      }
      const key = parseInt(el.dataset.key, 10);
      const entries = prevState["data"].filter(e => e.key !== key);
      if (entries.length) {
        return {data: entries};
      }
      return {
        data: [BudgetCreationModal.newRow()],
        dataLastKey: 0,
      };
    });
  }

  handleDateChange(result) {
    this.setState({date: result.target.value});
  }

  _renderSubTransactionsRow(item, index) {
    const iconButton = item.subCategory ? <img src={`/icon/${item.subCategory.imagePath}`} style={{maxWidth: "15%", marginRight: "1rem"}} />
      : <Icon size="small" icon="magnifying-glass" />;
    const labelButton = item.subCategory ? item.subCategory.name : "Choisir une catégorie";
    return <Columns key={item.key} className="row-category">
      <input
        className="is-hidden"
        name={`data[${index}][subCategory]`}
        defaultValue={item.subCategory?.id === undefined ? item.subCategory : item.subCategory.id}
        readOnly
      />
      <Column>
        <Input
          className="input"
          placeholder="Montant"
          type="text"
          name={`data[${index}][amount]`}
          value={item.amount}
          data-list="data"
          data-propname="amount"
          data-key={item.key}
          onChange={this.handleListChange}
          horizontal
        />
      </Column>
      <Column>
        <Button
          label={labelButton}
          icon={iconButton}
          data-key={item.key}
          data-list="data"
          onClick={this.handleOpenCategoryModal}
        />
      </Column>
      <Column>
        <Button
          label={""}
          icon={<Icon
            icon="times"
            faSize="lg"
            size="big"
          />}
          data-key={item.key}
          data-btn="remove"
          onClick={this.handleRemoveFromList}
        />
      </Column>
    </Columns>;
  }

  _renderData() {
    return <div className="block-row-category">
      {this.state.data.map((row, index) => this._renderSubTransactionsRow(row, index))}
      <hr />
      <Columns>
        <Column offset={Column.Offsets.fourFifths}>
          <Button
            label=""
            icon={<Icon
              icon="plus"
              faSize="lg"
              size="small"
            />}
            data-btn="add"
            data-list="data"
            onClick={this.handleRowToData}
          />
        </Column>
      </Columns>
    </div>;
  }

  /* eslint-disable-next-line max-lines-per-function */
  _renderConfirm() {
    if (this.state.id === null) return null;
    let action = null;
    let title = null;
    if (this.state.id !== 0) {
      action = `/budget/${this.state.id}/edit`;
      title = "Modifier la budget";
    } else {
      title = "Créer un nouveau budget";
      action = "/budget/new";
    }

    const categoryIconButton = this.state.category ? <img src={`/icon/${this.state.category.imagePath}`} style={{maxWidth: "15%", marginRight: "1rem"}} />
      : <Icon size="small" icon="magnifying-glass" />;
    const categoryLabelButton = this.state.category ? this.state.category.name : "Choisir une catégorie";

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
        ref={this.budgetFormRef}
        method="POST"
        action={action}
      >
        <Columns>
          <Column>
            <Title size={4} className="mb-2">{title}</Title>
          </Column>
        </Columns>
        <Columns>
          <Column>
            <Input
              className="input"
              label="Nom"
              placeholder="Nom"
              type="text"
              name={"name"}
              value={this.state.name}
              data-propname="name"
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Input
              className="input"
              label="Durée"
              placeholder="Durée"
              type="text"
              name={"duration"}
              value={this.state.duration}
              data-propname="duration"
              onChange={this.handleChange}
            />
          </Column>
          <Column>
            <Select
              label="Périodicité"
              type="text"
              name="unit"
              defaultValue={this.state.unit}
              data-propname={"unit"}
              onChange={this.handleChange}
              options={[
                {
                  value: "year",
                  label: "Annuel",
                },
                {
                  value: "month",
                  label: "Mensuel",
                },
                {
                  value: "week",
                  label: "Hebdomadaire",
                },
              ]}
            />
          </Column>
        </Columns>
        <Columns>
          <Column>
            <div className="field-label has-text-centered">
              <label className="label">
                Choix de la catégorie
              </label>
            </div>
            <Button
              label={categoryLabelButton}
              icon={categoryIconButton}
              data-list={null}
              onClick={this.handleOpenCategoryModal}
            />
          </Column>
          <Column>
            <Input
              className="input"
              label="Montant total allouée"
              placeholder="Montant total allouée"
              type="text"
              name={"totalAllocatedAmount"}
              value={this.state.totalAllocatedAmount}
              data-propname="totalAllocatedAmount"
              onChange={this.handleChange}
            />
          </Column>
        </Columns>
        {this._renderData()}
      </form>
      <br />
      <CategoryModal
        visible={this.state.modal === "category"}
        onConfirm={this.handleCategoryChange}
        onClose={this.handleCloseModal}
        categories={this.state.categories}
        genre="OUTCOME"
      />
    </Modal>;
  }

  render() {
    return <div>
      {this._renderConfirm()}
      <Modal
        visible={this.state.alert}
        type="alert"
        confirmText="Recharger la page"
        handleConfirm={BudgetCreationModal.handleAlertClick}
      >
        <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
        <p>Si le problème persiste, merci de contacter les responsables du site.</p>
      </Modal>
    </div>;
  }
}
BudgetCreationModal.displayName = "BudgetCreationModal";
BudgetCreationModal.propTypes = {onRegisterModal: PropTypes.func.isRequired};
// BudgetCreationModal.defaultProps = {budget: undefined};

module.exports = BudgetCreationModal;
