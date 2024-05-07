const React = require("react");
const PropTypes = require("prop-types");

const $ = React.createElement;

class Title extends React.Component {
  constructor(props) {
    super(props);

    this.className = [
      "title",
      !props.legacy && `is-${props.size}`,
      props.color && `is-${props.color}`,
      props.centered && "has-text-centered",
      props.className,
    ]
      .filter(e => e)
      .join(" ");
  }

  render() {
    return $(
      `h${this.props.size}`,
      {className: this.className},
      this.props.children,
    );
  }
}
Title.displayName = "Title";
Title.propTypes = {
  centered: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  legacy: PropTypes.bool,
  size: PropTypes.number,
};
Title.defaultProps = {
  centered: false,
  className: undefined,
  color: undefined,
  legacy: false,
  size: 2,
};

module.exports = Title;
