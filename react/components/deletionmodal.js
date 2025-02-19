const React = require("react");
const PropTypes = require("prop-types");

const axios = require("axios");
const {OK} = require("../../express/utils/error.js");
const Modal = require("./modal.js");

class DeletionModal extends React.Component {
  static handleAlertClick() {
    /* eslint-disable-next-line no-self-assign */
    window.location = window.location;
  }

  constructor(props) {
    super(props);
    this.state = {
      item: {},
      type: "",
      confirm: false,
      alert: false,
      error: false,
      pending: false,
    };

    this.openModal = this.openModal.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.deletionFormRef = React.createRef();
  }

  componentDidMount() {
    window.openDeletionModal = this.openModal;
    if (this.props.onRegisterModal) {
      this.props.onRegisterModal("deletion", this.openModal);
    }
  }

  /* componentDidUpdate(_prevProps, prevState) {
    if (!prevState.pending && this.state.pending) {
      this.deletionFormRef.current.submit();
    }
  } */

  render() {
    return <div>
      {this._renderConfirm()}
      {this._renderAlert()}
    </div>;
  }

  _renderConfirm() {
    let content = null;
    if (this.state.type === "accountType") {
      content = <p>{`Voulez vous vraiment supprimer le type de compte ${this.state.item.name} ?`} <br />
        Assurez vous que le solde de ce compte est bien à 0€ car <span className="has-text-danger">cette action est définitive et irréversible</span>
      </p>;
    } else if (this.state.type === "account") {
      content = <p>{`Voulez vous vraiment supprimer le compte ${this.state.item.name} ?`} <br />
        Assurez vous que le solde de ce compte est bien à 0€ car <span className="has-text-danger">cette action est définitive et irréversible</span>
      </p>;
    } else if (this.state.type === "planned-transfer") {
      content = <p>{`Voulez vous vraiment supprimer le virement planifié ${this.state.item.plannedTransfer.other} ?`}</p>;
    }
    return <Modal
      visible={this.state.confirm}
      pending={this.state.pending}
      type="confirm"
      cancelText="Annuler"
      confirmText="Supprimer"
      onClose={this.handleCloseClick}
      onConfirm={this.handleConfirmClick}
      iconType="danger"
    >
      {content}
      {this.state.pending && <p>
        <span className="has-text-info">Traitement en cours, veuillez patienter.</span>
      </p>}
    </Modal>;
  }

  _renderAlert() {
    return <Modal
      visible={this.state.alert}
      type="alert"
      confirmText="Recharger la page"
      onConfirm={DeletionModal.handleAlertClick}
    >
      <p>Une erreur est survenue lors de l'effacement:</p>
      <p>{this.state.error}</p>
    </Modal>;
  }

  openModal(item, type) {
    let action = "";
    if (type === "accountType") {
      action = `/settings/preferences/account-type/${item.id}/delete`;
    } else if (type === "account") {
      action = `/account/${item.id}/delete`;
    } else if (type === "planned-transfer") {
      action = `/planned-transfer/${item.plannedTransfer.id}/delete`;
    }
    this.setState({type, item, action, confirm: true});
  }

  handleCloseClick() {
    this.setState({
      confirm: false,
      alert: false,
    });
  }

  handleConfirmClick() {
    if (this.state.pending) return;
    axios.post(this.state.action)
      .then(response => {
        if (response.status === OK && response.data.status === OK) {
          this.props.updateData(response.data.rows.rows);
          this.setState({confirm: false});
        } else {
          this.setState({alert: true, error: response.data.error});
        }
      })
      .catch(error => {
        this.setState({alert: true, error});
      });
  }
}
DeletionModal.displayName = "DeletionModal";
DeletionModal.propTypes = {
  onRegisterModal: PropTypes.func,
  updateData: PropTypes.func.isRequired,
};
DeletionModal.defaultProps = {onRegisterModal: undefined};

module.exports = DeletionModal;
