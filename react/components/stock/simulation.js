/* global axios */
const React = require("react");
const PropTypes = require("prop-types");
const Decimal = require("decimal.js");
const Head = require("../helpers/head.js");
const Columns = require("../bulma/columns.js");
const Column = require("../bulma/column.js");
const Icon = require("../bulma/icon.js");
const Button = require("../bulma/button.js");
const Media = require("../bulma/media.js");
const {OK} = require("../../../express/utils/error.js");
const AsyncFilteredList = require("../asyncfilteredlist.js");
const Constants = require("../../../express/constants/constants.js");
const DatePicker = require("../datepicker.js");
const OrderTypeFull = require("../../../express/constants/ordertypefull.js");
const moment = require("moment/moment");

class Simulation extends AsyncFilteredList {
  constructor(props) {
    super(props);

    // define properties to search
    this.s = [
      {key: "portfolio"},
      {key: "year"},
      {key: "orderBy"},
      {key: "orderDirection"},
    ];
    this.searchUri = "/stocks/simulation/search";

    this.base = "/stocks/simulation";

    this.state = {
      ...this.defaultState(),
      ...props.query,
      simulation: this.props.simulation,
      year: new moment().year(2024).toString(),
    };
  }

  _renderFilters() {
    return <form className="filters">
      {this._renderFilterWrapper(
        "Du: ",
        <DatePicker
          name="year"
          selected={new Date(this.state.year)}
          dateFormat="yyyy"
          autoComplete="off"
          onChangeLegacy={date => this.handleChange(date, "year")}
          showYearPicker
        />,
      )}
      {this._renderFilterSelect(
        "portfolio",
        "Portfolio:",
        this.props.portfolios.rows
          .map(e => ({value: e.id, label: e.account.name})),
      )}
    </form>;
  }

  render() {
    return <div className="body-content">
      <Head className="has-text-centered">
        Simulation/Prévision
      </Head>
      {this._renderFilters()}
      <hr />
      <Columns>
        <Column>
          <div className="box slide-in is-clickable">
            <div className="columns is-flex">
              <Column>
                <b>Début: </b>
                <b>Fin: </b>
              </Column>
              <Column>
                <b>{this.props.simulation.startBalance} €</b>
                <b>{this.props.simulation.endBalance} €</b>
              </Column>
            </div>
          </div>
        </Column>
        <Column>
          <div className="box slide-in is-clickable">
            <div className="columns is-flex">
              <Column>
                <b>Gain Total: </b>
                <b>Gain Net: </b>
              </Column>
              <Column>
                <b>{this.props.simulation.totalGain} €</b>
                <b>{this.props.simulation.netGain} €</b>
              </Column>
            </div>
          </div>
        </Column>
        <Column>
          <div className="box slide-in is-clickable">
            <div className="columns is-flex">
              <Column>
                <b>Gain Intérêts: </b>
                <b>Gain Dividendes: </b>
              </Column>
              <Column>
                <b>{this.props.simulation.interestGain} €</b>
                <b>{this.props.simulation.dividendGain} €</b>
              </Column>
            </div>
          </div></Column>
      </Columns>
    </div>;
  }
}

Simulation.displayName = "Simulation";
Simulation.propTypes = {
  simulation: PropTypes.object,
  portfolio: PropTypes.array,
};
Simulation.defaultProps = {};

module.exports = Simulation;
