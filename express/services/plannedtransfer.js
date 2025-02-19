const assert = require("assert");
const {
  sequelize,
  Sequelize,
  Account,
  PlannedTransfer,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");

const plannedTransferSrv = {};

plannedTransferSrv.get = id => {
  logger.info("Get transaction by id=[%s]", id);
  return PlannedTransfer.findOne({where: {id}});
};

plannedTransferSrv.getAllByUser = (userId, query) => {
  logger.debug("Get all transaction for user=[%s]", userId);
  assert(userId, "User Id cannot be null");
  const cond = {
    userId,
    deletedOn: {[Op.eq]: null},
  };
  if (query) {
    if (query.notTransfersId) {
      cond.id = {[Op.not]: query.notTransfersId};
    }
    if (query.endingDate) {
      cond.transferDate = {
        [Op.between]: [
          new Date(query.startDate),
          new Date(query.endingDate),
        ],
      };
    }
  }
  return PlannedTransfer.findAndCountAll({
    where: cond,
    include: [
      {
        association: PlannedTransfer.Sender,
        include: [{association: Account.AccountType}],
      },
      {
        association: PlannedTransfer.Receiver,
        include: [{association: Account.AccountType}],
      },
    ],
    order: [["transferDate", OrderDirection.ASC]],
  });
};

plannedTransferSrv.create = async (userId, transferData) => {
  logger.debug("Create transaction for user=[%s] with data=[%s]", userId, transferData);

  return PlannedTransfer.create({
    userId,
    senderId: transferData.sender,
    receiverId: transferData.receiver,
    amount: transferData.amount,
    other: transferData.other,
    transferDate: new Date(transferData.date),
    occurence: transferData.occurence,
    unit: transferData.unit,
    number: transferData.number,
  });
};

plannedTransferSrv.update = async (id, data) => {
  logger.debug("Edit transaction=[%s] with data=[%s]", id, data);

  return PlannedTransfer.update({
    amount: data.amount,
    from: data.from,
    to: data.to,
    other: data.notes,
    transferDate: new Date(data.date),
  }, {where: {id}});
};

plannedTransferSrv.delete = id => {
  logger.debug("Delete transaction=[%s]", id);
  return PlannedTransfer.update(
    {deletedOn: new Date()},
    {where: {id}},
  );
};

plannedTransferSrv.getAllByAccount = accountId => {
  logger.debug("Get all transfers by account=[%s]", accountId);
  return PlannedTransfer.findAndCountAll({
    where: {
      [Op.or]: [
        {senderId: accountId},
        {receiverId: accountId},
      ],
    },
    order: [["transferDate", OrderDirection.DESC]],
  });
};

module.exports = plannedTransferSrv;
