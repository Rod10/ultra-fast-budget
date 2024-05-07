const React = require("react");
const PropTypes = require("prop-types");

const PlanTypes = require("../../../express/constants/plantypes.js");

const HeadTypes = {
  ADMIN: "ADMIN",
  EDWIN: "EDWIN",
  EDWIN_EP: "EDWIN_EP",
  PRE_EDWIN: "PRE_EDWIN",
};

const logos = {
  [HeadTypes.ADMIN]: "/images/logo.png",
  [HeadTypes.EDWIN]: "/images/logo.png",
  [HeadTypes.EDWIN_EP]: "/images/svg/logo_edwin_ep.svg",
  [HeadTypes.PRE_EDWIN]: "/images/logo_pre_orange.png",
};

const titles = {
  [HeadTypes.ADMIN]: "administrateur",
  [HeadTypes.EDWIN]: "abonné",
  [HeadTypes.PRE_EDWIN]: "de préparation",
};

class Head extends React.Component {
  render() {
    let logoSrc = logos[this.props.type];
    let isEp = false;
    if (this.props.type === HeadTypes.EDWIN) {
      const planType = this.props.society.subscription.planType;
      isEp = planType === PlanTypes.EP;
      if (isEp) {
        logoSrc = logos[HeadTypes.EDWIN_EP];
      }
    }

    return <div className="has-text-centered">
      <h3 className="title is-3">
        {`Bienvenue dans l'interface ${titles[this.props.type]}`}
      </h3>
      <div className={`image logo ${isEp ? "ep" : ""}`}>
        <img src={logoSrc} />
      </div>
    </div>;
  }
}
Head.displayName = "Head";
Head.propTypes = {
  society: PropTypes.object,
  type: PropTypes.oneOf([
    HeadTypes.ADMIN,
    HeadTypes.EDWIN,
    HeadTypes.PRE_EDWIN,
  ]).isRequired,
};
Head.defaultProps = {society: undefined};

module.exports = Head;
Head.HeadTypes = HeadTypes;
