const React = require("react");
const PropTypes = require("prop-types");

class Figure extends React.Component {
  render() {
    return <figure
      className={`image is-${this.props.size}`}
      title={this.props.title}
    >
      <img src={this.props.src} />
    </figure>;
  }
}
Figure.displayName = "Figure";
Figure.propTypes = {
  size: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
};
Figure.defaultProps = {title: ""};

module.exports = Figure;
