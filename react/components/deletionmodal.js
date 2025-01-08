const React = require("react");
const PropTypes = require("prop-types");

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
      action: "",
      confirm: false,
      alert: false,
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

  componentDidUpdate(_prevProps, prevState) {
    if (!prevState.pending && this.state.pending) {
      this.deletionFormRef.current.submit();
    }
  }

  render() {
    return <div>
      {this._renderConfirm()}
      {this._renderAlert()}
    </div>;
  }

  _renderConfirm() {
    let content = null;
    /*if (this.state.item.type === "work-order" || this.state.item.type === "work-order-updated") {
      if (this.state.item.docId) {
        content = <p>{`Supprimer le document ${this.state.item.docName} associé au bon de travail ${this.state.item.reference}`}</p>;
        action = `${base}/document/${this.state.item.docId}/delete`;
      } else {
        content = <p>{`Supprimer le bon de travail ${this.state.item.reference} ?`}</p>;
      }
    } else if (this.state.item.type === "manoeuvre") {
      content = <p>{`Supprimer la fiche de manœuvre ${this.state.item.reference} ?`}</p>;
    } else if (this.state.item.type === "other-documents") {
      if (this.state.item.docId) {
        content = (
          <p>{`Supprimer le document ${this.state.item.docName} associé au document ${this.state.item.reference}`}</p>
        );
        action = `${base}/document/${this.state.item.docId}/delete`;
      } else {
        content = <p>{`Supprimer le document ${this.state.item.reference} ?`}</p>;
      }
    } else if (this.state.item.type === "otst-byes") {
      if (this.state.item.docId) {
        content = <p>{`Supprimer le document ${this.state.item.docName} associé a l'ordre de travail sous tension' ${this.state.item.reference}`}</p>;
        action = `${base}/document/${this.state.item.docId}/delete`;
      } else {
        content = <p>{`Supprimer l'ordre de travail sous tension ${this.state.item.reference} ?`}</p>;
      }
    } else if (this.state.item.type === "rapport-depannage") {
      if (this.state.item.docId) {
        content = <p>{`Supprimer le document ${this.state.item.docName} associé au rapport après dépannage ${this.state.item.reference}`}</p>;
        action = `${base}/document/${this.state.item.docId}/delete`;
      } else {
        content = <p>{`Supprimer le rapport après dépannage ${this.state.item.reference} ?`}</p>;
      }
    } else if (this.state.item.type === "quizz") {
      if (this.state.item.subType === "userQuizz") {
        content = <p>{`Supprimer le quiz de ${this.state.item.user} ?`}</p>;
        action = `${base}/delete-quizz`;
      } else {
        content = <p>{`Supprimer la question n°${this.state.item.reference} ?`}</p>;
      }
    } else if (this.state.item.type === "annex-work-order") {
      content = <p>{`Attention si vous supprimer l'annexe reliée au BT+ n°${this.state.item.reference}, vous ne pourrez pas en recréer une`}</p>;
    } else {
      content = <p>Supprimer l'article ?</p>;
    }*/
    content = "test";
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
        action={`${this.state.action}/delete`}
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
      <p>Une erreur est survenue lors de l'effacement, rechargez la page et ré-essayez</p>
      <p>Si le problème persiste, merci de contacter les responsables du site.</p>
    </Modal>;
  }

  openModal(item, action) {
    this.setState({item, action, confirm: true});
  }

  handleCloseClick() {
    this.setState({
      confirm: false,
      alert: false,
    });
  }

  handleConfirmClick() {
    if (this.state.pending) return;

    if (this.deletionFormRef.current.reportValidity()) {
      this.setState({pending: true});
    }
  }
}
DeletionModal.displayName = "DeletionModal";
DeletionModal.propTypes = {onRegisterModal: PropTypes.func};
DeletionModal.defaultProps = {onRegisterModal: undefined};

module.exports = DeletionModal;
