const path = require("path");
const webpack = require("webpack");

/* eslint-disable-next-line no-process-env */
const env = process.env.NODE_ENV === "production"
  ? "production"
  : "development";

const VIEWS = "./webres/views/";

const config = {
  mode: env,
  // webpack options
  entry: {
    "homepage": `${VIEWS}/homepage.js`,
    "navbar": `${VIEWS}/navbar.js`,

    "accountlist": `${VIEWS}/accountlist.js`,
    "accountdetails": `${VIEWS}/accountdetails.js`,
    "budgetlist": `${VIEWS}/budgetlist.js`,
    "transactionlist": `${VIEWS}/transactionlist.js`,
    "plannedtransactionlist": `${VIEWS}/plannedtransactionlist.js`,
    "plannedtransferlist": `${VIEWS}/plannedtransferlist.js`,

    "settingshomepage": `${VIEWS}/settingshomepage.js`,
    "preference": `${VIEWS}/preference.js`,
    "categorylist": `${VIEWS}/categorylist.js`,
    "accounttypelist": `${VIEWS}/accounttypelist.js`,

    "categories": `${VIEWS}/categories.js`,
    "forecast": `${VIEWS}/forecast.js`,
  },
  output: {
    path: path.resolve(__dirname, "dist", "public", "js"),
    filename: "[name].js",
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "prop-types": "PropTypes",
    "moment": "moment",
    "axios": "axios",
    "btoa": "btoa",
    "atob": "atob",
  },
  module: {
    rules: [
      {
        test: /\.css$/u,
        use: ["css-loader"],
      },
      {
        test: /\.js$/u,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({"process.env.NODE_ENV": JSON.stringify(env)}),
  ],
  stats: {
    // Configure the console output
    builtAt: true,
  },
  resolve: {modules: [path.resolve("node_modules")]},
};

if (env === "development") {
  config.devtool = "eval-source-map";
}

module.exports = config;
