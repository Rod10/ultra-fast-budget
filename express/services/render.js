const React = require("react");
const ReactDOMServer = require("react-dom/server.js");

const UserLogin = require("../../react/components/userlogin.js");
const UserRegister = require("../../react/components/userregister.js");
const NavBar = require("../../react/components/navbar.js");
const Homepage = require("../../react/components/homepage.js");
const SettingsHomepage = require("../../react/components/settingshomepage.js");
const AccountList = require("../../react/components/accountlist.js");
const Preference = require("../../react/components/preference.js");
const CategoryList = require("../../react/components/categorylist.js");
const TransactionList = require("../../react/components/transaction/transactionlist.js");
const PlannedTransactionList = require("../../react/components/transaction/plannedtransactionlist.js");
const AccountDetails = require("../../react/components/accountdetails.js");
const BudgetList = require("../../react/components/budget/budgetlist.js");
const Categories = require("../../react/components/graphics/categories.js");
const Forecast = require("../../react/components/graphics/forecast.js");
const PlannedTransferList = require("../../react/components/plannedtransferlist.js");
const AccountTypeList = require("../../react/components/accounttype/accounttypelist.js");

const render = [
  {name: "userLogin", component: UserLogin},
  {name: "userRegister", component: UserRegister},
  {name: "navbar", component: NavBar},
  {name: "homepage", component: Homepage},
  {name: "accountList", component: AccountList},
  {name: "settingsHomepage", component: SettingsHomepage},
  {name: "preference", component: Preference},
  {name: "categoryList", component: CategoryList},
  {name: "transactionList", component: TransactionList},
  {name: "plannedTransactionList", component: PlannedTransactionList},
  {name: "accountDetails", component: AccountDetails},
  {name: "budgetList", component: BudgetList},
  {name: "categories", component: Categories},
  {name: "forecast", component: Forecast},
  {name: "plannedTransferList", component: PlannedTransferList},
  {name: "accountTypeList", component: AccountTypeList},
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
