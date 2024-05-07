const React = require("react");
const PropTypes = require("prop-types");

class Message extends React.Component {
  render() {
    return <article className={`message ${this.props.type}`}>
      {this.props.header && <div className="message-header">
        <p>{this.props.header}</p>
        {this.props.onClose && <button type="button" className="delete" aria-label="delete" />}
      </div>}
      <div className="message-body">
        {this.props.children}
      </div>
    </article>;
  }
}
Message.displayName = "Message";
Message.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.string,
  onClose: PropTypes.func,
  type: PropTypes.string,
};
Message.defaultProps = {
  header: undefined,
  onClose: undefined,
  type: "",
};

module.exports = Message;
