const React = require("react");
const PropTypes = require("prop-types");

class Head extends React.Component {
  constructor(props) {
    super(props);

    this.className = [
      "head",
      props.color && `is-${props.color}`,
      props.centered && "has-text-centered",
      props.className,
    ]
      .filter(e => e)
      .join(" ");
  }

  render() {
    return <div className={this.className}>
      {this.props.img && <img src={this.props.img} />}
      <h2>{this.props.children}</h2>
    </div>;
  }
}
Head.displayName = "Head";
Head.propTypes = {
  centered: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  img: PropTypes.string,
};
Head.defaultProps = {
  centered: false,
  className: undefined,
  color: undefined,
  img: undefined,
};

module.exports = Head;
