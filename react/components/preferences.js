const React = require("react");
const PropTypes = require("prop-types");

const Button = require("./bulma/button.js");
const Icon = require("./bulma/icon.js");
const Title = require("./bulma/title.js");
const Columns = require("./bulma/columns.js");
const Column = require("./bulma/column.js");

const Head = require("./helpers/head.js");

const Toogle = require("./form/toogleinput.js");

class Preferences extends React.Component {
  render() {
    return <div className="container is-fluid">
      <Head>
        Préférence
      </Head>
      <div>
        <Button
          className="has-text-weight-bold mr-3"
          type="themed"
          icon={<Icon size="small" icon="pen" />}
          label="Gérer vos catégories"
          href="/settings/preferences/category/list"
        />
        <br />
        <br />
        <Button
          className="has-text-weight-bold mr-3"
          type="themed"
          icon={<Icon size="small" icon="pen" />}
          label="Gérer vos type de compte"
          href="/settings/preferences/account-type"
        />
        <br />
        <br />
        <Button
          className="has-text-weight-bold mr-3"
          type="themed"
          icon={<Icon size="small" icon="pen" />}
          label="Gérer vos modèles de transactions"
          href="/settings/preferences/transaction/list"
        />
        <hr />
        <Button
          className="has-text-weight-bold mr-3"
          type="themed"
          icon={<Icon size="small" icon="pen" />}
          label="Couleur des pages"
          // onClick={open modal}
        />
        <br />
        <br />
        <p className="is-flex is-align-items-center">
          <b className="mr-3">Mode sombre: </b>
          <Toogle
            // className="red"
            checked={false}
            id={0}
            // onChange={this.onToggleDomainChange}
          />
        </p>
      </div>
    </div>;
  }
}

Preferences.displayName = "Preferences";
Preferences.propTypes = {};
Preferences.defaultProps = {};

module.exports = Preferences;
