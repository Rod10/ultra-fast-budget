const React = require("react");
const PropTypes = require("prop-types");

const Modal = require("./modal.js");
const axios = require("axios");
const {OK} = require("../../express/utils/error.js");

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
    let action = null;
    if (this.state.type === "accountType") {
      content = <p>{`Voulez vous vraiment supprimer le type de compte ${this.state.item.name} ?`} <br/>
        Assurez vous que le solde de ce compte est bien à 0€ car <span className="has-text-danger">cette action est définitive et irréversible</span>
      </p>;
      action = `/settings/preferences/account-type/${this.state.item.id}/delete`;
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
      <form
        ref={this.deletionFormRef}
        method="POST"
        action={action}
      >
        {content}
        {this.state.pending && <p>
          <span className="has-text-info">Traitement en cours, veuillez patienter.</span>
        </p>}
      </form>
    </Modal>;
  }

  _renderAlert() {
    return <Modal
      visible={this.state.alert}
      type="alert"
      confirmText="Recharger la page"
      onConfirm={this.handleAlertClick}
    >
      <p>Une erreur est survenue lors de l'effacement:</p>
      <p>{this.state.error}</p>
    </Modal>;
  }

  openModal(type, item) {
    this.setState({type, item, action: `/settings/preferences/account-type/${item.id}/delete`, confirm: true});
  }

  handleCloseClick() {
    this.setState({
      confirm: false,
      alert: false,
    });
  }

  handleConfirmClick() {
    if (this.state.pending) return;
    console.log("test");
    axios.post(this.state.action)
      .then(response => {
        console.log(response);
        if (response.status === OK && response.data.status === OK) {
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
DeletionModal.propTypes = {onRegisterModal: PropTypes.func};
DeletionModal.defaultProps = {onRegisterModal: undefined};

module.exports = DeletionModal;
