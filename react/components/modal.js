const React = require("react");
const PropTypes = require("prop-types");

const types = {
  ALERT: "alert",
  CONFIRM: "confirm",
};
const iconTypes = {
  DANGER: "danger",
  INFO: "info",
  QUESTION: "question",
};

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  /* eslint-disable-next-line class-methods-use-this */
  handleClick(fn) {
    return evt => {
      evt.preventDefault();
      fn();
    };
  }

  _renderAlert() {
    return <div>
      <button
        type="button"
        className="button is-info"
        onClick={this.handleClick(this.props.onConfirm)}
      >{this.props.confirmText}</button>
    </div>;
  }

  _renderConfirm() {
    return <div>
      <button
        type="button"
        className="button is-info"
        onClick={this.handleClick(this.props.onClose)}
        disabled={this.props.pending}
      >{this.props.cancelText}</button>
      {this.props.confirmText && <button
        type="button"
        className={`button ${this.props.iconType === "danger" ? "is-danger" : "is-info"} ${this.props.pending ? " is-loading" : ""}`}
        onClick={this.handleClick(this.props.onConfirm)}
        disabled={this.props.disableConfirm}
      >{this.props.confirmText}</button>}
    </div>;
  }

  render() {
    const isAlert = this.props.type === types.ALERT;
    let iconWrapper = "icon is-large ";
    let iconClass = "fa fa-3x ";
    if (this.props.iconType === iconTypes.INFO) {
      iconWrapper += "has-text-info";
      iconClass += "fa-info-circle";
    } else if (this.props.iconType === iconTypes.DANGER) {
      iconWrapper += "has-text-danger";
      iconClass += "fa-exclamation-triangle";
    } else if (this.props.iconType === iconTypes.QUESTION) {
      iconWrapper += "has-text-info";
      iconClass += "fa-question-circle";
    } else {
      iconWrapper += "has-text-warning";
      iconClass += "fa-exclamation-triangle";
    }

    return <div className={`modal${this.props.visible ? " is-active" : ""}`}>
      <div
        className="modal-background"
        onClick={(isAlert ? undefined : this.handleClick(this.props.onClose))}
      />
      <div className={`modal-card ${this.props.modalClassName}`}>
        <div className="modal-card-body">
          {!isAlert && <button
            type="button"
            className="delete is-large"
            onClick={this.handleClick(this.props.onClose)}
          />}
          <div className="content has-text-centered">
            <figure>
              <span className={iconWrapper}><i className={iconClass} /></span>
            </figure>
            <div className="modal-p">{this.props.children}</div>
            {isAlert
              ? this._renderAlert()
              : this._renderConfirm()}
          </div>
        </div>
      </div>
    </div>;
  }
}
Modal.displayName = "Modal";
Modal.propTypes = {
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  children: PropTypes.node,
  disableConfirm: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  iconType: PropTypes.string,
  modalClassName: PropTypes.string,
  pending: PropTypes.bool,
  type: PropTypes.string,
  visible: PropTypes.any,
};
Modal.defaultProps = {
  cancelText: undefined,
  children: null,
  confirmText: undefined,
  disableConfirm: false,
  onClose: undefined,
  onConfirm: undefined,
  iconType: undefined,
  modalClassName: "",
  pending: false,
  type: undefined,
  visible: undefined,
};
Modal.Types = types;
Modal.IconTypes = iconTypes;

module.exports = Modal;
