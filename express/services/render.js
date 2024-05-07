const React = require("react");
const ReactDOMServer = require("react-dom/server.js");

const UserLogin = require("../../react/components/userlogin.js");
const UserRegister = require("../../react/components/userregister.js");

const render = [
  {name: "userLogin", component: UserLogin},
  {name: "userRegister", component: UserRegister},
].reduce((acc, cur) => {
  acc[cur.name] = props => {
        // this is to reset react-beautiful-dnd context
    if (cur.component.resetServerContext) cur.component.resetServerContext();
    return ReactDOMServer.renderToString(
      React.createElement(cur.component, props),
    );
  };
  return acc;
}, {});

module.exports = render;
