const React = require("react");
const PropTypes = require("prop-types");
const {preventDefault} = require("../utils/html.js");

class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {doc: this.props.doc};

    this.handleFileChange = this.handleFileChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.doc !== prevProps.doc
      && this.props.doc?.name !== prevProps.doc?.name
      && this.props.doc?.lastModified !== prevProps.doc?.lastModified) {
      this.setState({doc: this.props.doc});
    }
  }

  render() {
    return <div className="file has-name is-right is-fullwidth">
      <label className="file-label">
        <input
          className="file-input"
          type="file"
          name={this.props.name}
          onChange={this.handleFileChange}
          autoComplete="off"
          accept={this.props.accept}
          multiple={this.props.multiple}
          disabled={this.props.disabled}
        />
        <span className="file-cta">
          <span className="file-icon"><i className="fa fa-paperclip" /></span>
        </span>
        {this.state.doc
          ? <span className="file-name has-text-link">{this.state.doc.name}</span>
          : <span className="file-name">{this.props.label}</span>}
      </label>
    </div>;
  }

  handleFileChange(evt) {
    preventDefault(evt);

    if (this.props.handleFileChange) {
      this.props.handleFileChange(evt);
    } else {
      const file = evt.target.files.length > 0 ? evt.target.files[0] : null;
      this.setState({doc: file});
    }
  }
}
FileInput.displayName = "FileInput";
FileInput.propTypes = {
  accept: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]),
  doc: PropTypes.object,
  handleFileChange: PropTypes.func,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
};
FileInput.defaultProps = {
  accept: undefined,
  doc: undefined,
  handleFileChange: undefined,
  label: undefined,
  multiple: false,
  disabled: false,
};

module.exports = FileInput;
