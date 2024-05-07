const React = require("react");
const PropTypes = require("prop-types");

class Button extends React.Component {
  render() {
    const {type, label, icon, href, className, fullWidth, isStatic, ...props} = this.props;
    let _className = `button ${className}`;
    if (type) _className += ` is-${type}`;
    if (fullWidth) _className += " is-fullwidth";
    if (isStatic) _className += " is-static";
    const _label = label && <span>{label}</span>;
    if (href || isStatic) {
      return <a
        className={_className}
        href={props.disabled ? null : href}
        {...props}
      >
        {icon}
        {_label}
      </a>;
    }
    return <button className={_className} type="submit" {...props}>
      {icon}
      {_label}
    </button>;
  }
}
Button.displayName = "Button";
Button.propTypes = {
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  href: PropTypes.string,
  icon: PropTypes.object,
  isStatic: PropTypes.bool,
  label: PropTypes.string,
  type: PropTypes.string,
};
Button.defaultProps = {
  className: "",
  fullWidth: false,
  href: undefined,
  icon: undefined,
  isStatic: false,
  label: undefined,
  type: null,
};

module.exports = Button;
