const React = require("react");
const PropTypes = require("prop-types");

class Field extends React.Component {
  _renderLabel() {
    if (this.props.noLabel) return null;
    const label = this.props.label
      ? <label className="label">
        {this.props.label}
        {this.props.required && " *"}
      </label>
      : (
        <label
          className="label"
          /* eslint-disable-next-line react/no-danger */
          dangerouslySetInnerHTML={{__html: "&nbsp;"}}
        />
      );
    return this.props.horizontal
      ? <div className={`field-label ${this.props.fieldLabelClassName}`}>{label}</div>
      : label;
  }

  _renderHorizontal() {
    return <div className="field-body">
      {Array.isArray(this.props.children)
        ? this.props.children.filter(e => e).map(
          (e, i) => <div key={`${this.props.label}-${i}`} className={"field"}>
            <div className="control">{e}</div>
          </div>,
        )
        : <div className="field">
          <div className="control is-expanded">{this.props.children}</div>
          {this.props.error && <p className="help is-danger">{this.props.error}</p>}
          {this.props.helper && <p className="help">{this.props.helper}</p>}
        </div>}
    </div>;
  }

  _renderNormal() {
    return Array.isArray(this.props.children)
      ? this.props.children.filter(e => e).map(
        (e, i) => {
          let className = "control";
          if (this.props.expanded && this.props.expanded[i]) {
            className += " is-expanded";
          }
          return <div key={`${this.props.label}-${i}`} className={className}>{e}</div>;
        },
      )
      : <>
        <div className="control">{this.props.children}</div>
        {this.props.error && <p className="help is-danger">{this.props.error}</p>}
        {this.props.helper && <p className="help">{this.props.helper}</p>}
      </>;
  }

  render() {
    const horizontal = this.props.horizontal ? "is-horizontal" : "";
    return <div className={`field ${this.props.className} ${horizontal}`}>
      {this._renderLabel()}
      {this.props.subLabel && <label className="label is-small">{this.props.subLabel}</label>}
      {this.props.horizontal ? this._renderHorizontal() : this._renderNormal()}
    </div>;
  }
}
Field.displayName = "Field";
Field.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  expanded: PropTypes.array,
  fieldLabelClassName: PropTypes.string,
  helper: PropTypes.string,
  horizontal: PropTypes.bool,
  label: PropTypes.string,
  noLabel: PropTypes.bool,
  required: PropTypes.bool,
  subLabel: PropTypes.string,
};
Field.defaultProps = {
  className: "",
  error: undefined,
  expanded: [],
  fieldLabelClassName: "",
  helper: undefined,
  horizontal: false,
  label: null,
  noLabel: false,
  required: false,
  subLabel: null,
};

module.exports = Field;
