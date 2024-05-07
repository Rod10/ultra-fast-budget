const React = require("react");
const PropTypes = require("prop-types");

class Tabs extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    let el = evt.target;
    while (el.tagName !== "LI") {
      el = el.parentElement;
    }
    this.props.onChange(el.dataset.type);
  }

  render() {
    let className = `tabs ${this.props.style} ${this.props.className}`;
    if (this.props.fullWidth) {
      className += " is-fullwidth";
    }
    return <div className={className}>
      <ul onClick={this.handleChange}>
        {this.props.options.map(e => <li
          key={e.key}
          className={e.key === this.props.value ? "is-active" : ""}
          data-type={e.key}
        >
          <a>{e.label}</a>
        </li>)}
      </ul>
    </div>;
  }
}
Tabs.displayName = "Tabs";
Tabs.propTypes = {
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  style: PropTypes.string,
  value: PropTypes.string.isRequired,
};
Tabs.defaultProps = {
  className: "",
  fullWidth: false,
  style: "is-boxed",
};

module.exports = Tabs;
