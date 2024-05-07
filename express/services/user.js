/* TODO find a way to split this file in multiple files */
/* eslint-disable max-lines */
const assert = require("assert");
const nodeCrypto = require("node:crypto");

delete global._bitcore;
const Bitcore = require("bitcore-lib");

const {
  sequelize,
  Sequelize,
  User,
  Op,
} = require("../models/index.js");

const {FORBIDDEN} = require("../utils/error.js");
const utils = require("../utils/index.js");

const mailSrv = require("./mail.js");
const passwordSrv = require("./password.js");
const {logger} = require("./logger.js");

const userSrv = {};

const dataValidation = data => {
  assert(data, "Data cannot be null");
  assert(data.civility, "Civility cannot be null");
  assert(data.firstName, "First name cannot be null");
  assert(data.lastName, "Last name cannot be null");
  assert(data.email, "Email cannot be null");
  assert(data.password, "Password cannot be null");
  assert(data.confirmation, "Password confirmation cannot be null");
  assert(data.password.length >= passwordSrv.minPasswordLength, "Password too short");
  assert(
    data.password === data.confirmation,
    "Confirmation doesn't match password",
  );
};

userSrv.create = async data => {
  logger.debug("create new user");

  dataValidation(data);
  const password = await passwordSrv.hash(data.password);
  return User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password,
    civility: data.civility,
  });
};

userSrv.login = async data => {
  assert(data, "Data cannot be null");
  assert(data.email && data.password, "Email and password cannot be empty");

  logger.debug("Authenticate with email=[%s]", data.email);
  const user = await userSrv.getByEmail(data.email);
  /* if (contributor.state !== ContributorStates.ACTIVE) {
    throw new Error("Contributor is not activated or is blocked");
  } */
  const passed = await passwordSrv.compare(data.password, user.password);
  assert(passed, "Email and password do not match");
  return user;
};

userSrv.getByEmail = async email => {
  const user = await User.findOne({where: {email}});
  assert(user, "Contributor not found");
  return user;
};

module.exports = userSrv;
