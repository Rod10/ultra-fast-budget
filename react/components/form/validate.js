const React = require("react");
const PropTypes = require("prop-types");

const Button = require("../bulma/button.js");
const Column = require("../bulma/column.js");
const Columns = require("../bulma/columns.js");
const Icon = require("../bulma/icon.js");

class Validate extends React.Component {
  render() {
    const disabled = this.props.disabled ? "disabled" : "";
    return <div className={`validate has-text-centered is-${this.props.color} ${disabled}`}>
      <b>{this.props.label}</b>
      <figure>
        <Icon icon="check-circle-o" size="large" faSize="3x" />
      </figure>
      {this.props.alternativeButtonLabel
        ? <Columns>
          <Column>
            <Button
              disabled={disabled}
              type={this.props.color}
              label={this.props.buttonLabel}
              onClick={this.props.onClick}
            />
          </Column>
          <Column>
            <Button
              disabled={disabled}
              type={this.props.alternativeButtonColor}
              label={this.props.alternativeButtonLabel}
              onClick={this.props.onAlternativeClick}
            />
          </Column>
        </Columns>
        : (
          <Button
            disabled={disabled}
            type={this.props.color}
            label={this.props.buttonLabel}
            onClick={this.props.onClick}
          />
        )}
    </div>;
  }
}
Validate.displayName = "Validate";
Validate.propTypes = {
  alternativeButtonColor: PropTypes.string,
  alternativeButtonLabel: PropTypes.string,
  buttonLabel: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onAlternativeClick: PropTypes.func,
  label: PropTypes.string.isRequired,
};
Validate.defaultProps = {
  alternativeButtonColor: undefined,
  alternativeButtonLabel: undefined,
  buttonLabel: "VALIDER",
  color: "themed",
  disabled: false,
  onAlternativeClick: undefined,
};

module.exports = Validate;
