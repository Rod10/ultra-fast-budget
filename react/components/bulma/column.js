const React = require("react");
const PropTypes = require("prop-types");

const offsets = Object.freeze({
  fourFifths: "is-offset-four-fifths",
  threeQuarters: "is-offset-three-quarters",
  twoThirds: "is-offset-two-thirds",
  threeFifth: "is-offset-three-fifths",
  half: "is-offset-half",
  twoFifth: "is-offset-two-fifth",
  oneThird: "is-offset-one-third",
  oneQuarter: "is-offset-one-quarter",
  oneFifth: "is-offset-one-fifth",
  oneSixth: "is-offset-2",
});

const sizes = Object.freeze({
  full: "is-full",
  fourFifths: "is-four-fifths",
  threeQuarters: "is-three-quarters",
  twoThirds: "is-two-thirds",
  threeFifth: "is-three-fifths",
  half: "is-half",
  twoFifth: "is-two-fifth",
  oneThird: "is-one-third",
  oneQuarter: "is-one-quarter",
  oneFifth: "is-one-fifth",
});

class Column extends React.Component {
  render() {
    let className = "column";
    if (this.props.className) className += ` ${this.props.className}`;
    if (this.props.centered) className += " is-centered";
    if (this.props.gapless) className += " is-gapless";
    if (this.props.multiline) className += " is-multiline";
    if (this.props.offset) className += ` ${this.props.offset}`;
    if (this.props.size) className += ` ${this.props.size}`;
    return <div className={className}>
      {this.props.children}
    </div>;
  }
}
Column.displayName = "Column";
Column.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  centered: PropTypes.bool,
  gapless: PropTypes.bool,
  multiline: PropTypes.bool,
  offset: PropTypes.string,
  size: PropTypes.string,
};
Column.defaultProps = {
  centered: false,
  className: undefined,
  gapless: false,
  multiline: false,
  offset: undefined,
  size: "",
};
Column.Offsets = offsets;
Column.Sizes = sizes;

module.exports = Column;
