const React = require("react");
const PropTypes = require("prop-types");

class Modal extends React.Component {
  render() {
    return <div className={`modal ${this.props.visible ? "is-active" : ""}`}>
      <div
        className="modal-background"
        onClick={this.props.onClose}
      >
        <div className="modal-content">
          {this.props.children}
        </div>
        {this.props.onClose && <button
          className="modal-close is-large"
          type="button"
          onClick={this.props.onClose}
        />}
      </div>
    </div>;
  }
}
Modal.displayName = "Modal";
Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};
Modal.defaultProps = {
  onClose: undefined,
  visible: false,
};

module.exports = Modal;
