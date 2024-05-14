const React = require("react");
const PropTypes = require("prop-types");

const {
  Chart, CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  registerables,
} = require("chart.js");

const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

class SettingsHomepage extends React.Component {
  render() {
    return <div className="body-content">
      <Columns>
        <p>Settings</p>
      </Columns>
    </div>;
  }
}
SettingsHomepage.displayName = "SettingsHomePage";
SettingsHomepage.propTypes = {};
SettingsHomepage.defaultProps = {};

module.exports = SettingsHomepage;
