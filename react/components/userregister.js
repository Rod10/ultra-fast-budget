const React = require("react");

const Civilities = require("../../express/constants/civilities.js");
const Input = require("./bulma/input.js");
const Select = require("./bulma/select.js");

class UserRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      civility: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmation: "",
    };
  }

  _renderName() {
    return <>
      <Input
        label="Prénom"
        type="text"
        name="firstName"
        placeholder="Prénom"
        defaultValue={this.state.firstName || ""}
        autoFocus
      />
      <Input
        label="Nom de Famille"
        type="text"
        name="lastName"
        placeholder="Nom de Famille"
        defaultValue={this.state.lastName || ""}
        autoFocus
      />
    </>;
  }

  render() {
    return <div className="content">
      <div className="login-box">
        <div className="quizz-box">
          <h2 className="title">Inscription</h2>
          <form
            method="POST"
            action={"/register"}
          >
            <Select
              className="is-fullwidth"
              label="Civilité"
              name="civility"
              value={this.state.civility}
              options={Object.entries(Civilities)
                .map(([value, entry]) => ({value, label: entry.long}))}
              required
            />
            {this._renderName()}
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Email"
              defaultValue={this.state.email || ""}
              required
              autoFocus
            />
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="Mot de passe"
              defaultValue={this.state.password || ""}
              required
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmation"
              placeholder="Confirmer le mot de passe"
              defaultValue={this.state.confirmation || ""}
              required
            />
            <br />
            <div className="has-text-centered">
              <div>
                <button type="submit" className="button is-info">
                  <b>S'inscrire</b>
                  <span className="icon is-small">
                    <i className="fa fa-arrow-right" />
                  </span>
                </button>
              </div>
              <br />
            </div>
          </form>
        </div>
      </div>
    </div>;
  }
}
UserRegister.displayName = "UserRegister";

module.exports = UserRegister;
