const React = require("react");
const PropTypes = require("prop-types");

class Media extends React.Component {
  render() {
    return <div className={`media ${this.props.className}`}>
      {this.props.left && <div className="media-left">{this.props.left}</div>}
      {this.props.content && <div className="media-content">{this.props.content}</div>}
      {this.props.right && <div className="media-right">{this.props.right}</div>}
    </div>;
  }
}
Media.displayName = "Media";
Media.propTypes = {
  className: PropTypes.string,
  content: PropTypes.node,
  left: PropTypes.node,
  right: PropTypes.node,
};
Media.defaultProps = {
  className: "",
  content: undefined,
  left: undefined,
  right: undefined,
};

module.exports = Media;
