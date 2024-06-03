const assert = require("assert");
const {
  sequelize,
  Sequelize,
  Transfer,
  Op,
} = require("../models/index.js");
const OrderDirection = require("../constants/orderdirection.js");
const {logger} = require("./logger.js");
const accountSrv = require("./account.js");

const transferSrv = {};

transferSrv.get = id => {
  logger.info("Get transfer by id=[%s]", id);
  return Transfer.findOne({where: {id}});
};

transferSrv.getAllByUser = userId => {
  logger.debug("Get all transfer for user=[%s]", userId);

  assert(userId, "User Id cannot be null");

  return Transfer.findAndCountAll({
    where: {userId},
    include: [{association: Transfer.Account}],
    order: [["transferDate", OrderDirection.DESC]],
  });
};

transferSrv.getAllByAccount = accountId => {
  logger.debug("Get all transfers by account=[%s]", accountId);
  return Transfer.findAndCountAll({
    where: {
      [Op.or]: [
        {senderId: accountId},
        {receiverId: accountId},
      ],
    },
    order: [["transferDate", OrderDirection.DESC]],
  });
};

transferSrv.create = async (userId, transferData) => {
  logger.debug("Create transfer for user=[%s] with data=[%s]", userId, transferData);

  const transfer = await Transfer.create({
    userId,
    senderId: transferData.sender,
    receiverId: transferData.receiver,
    amount: transferData.amount,
    other: transferData.other,
    transferDate: new Date(transferData.date),
  });

  const transfers = await transferSrv.getAllByAccount(transfer.senderId);
  return accountSrv.rebalanceTransfer(transfer.senderId, transfer.receiverId, transfers);
};

transferSrv.update = async (id, data) => {
  logger.debug("Edit transfer=[%s] with data=[%s]", id, data);

  await Transfer.update({
    amount: data.amount,
    to: data.to,
    other: data.notes,
    transferDate: new Date(data.date),
  }, {where: {id}});

  const transfers = await transferSrv.getAllByAccount(data.account);
  return accountSrv.rebalanceTransfer(data.account, transfers);
};

transferSrv.delete = async id => {
  logger.debug("Delete transfer=[%s]", id);
  const transfer = await transferSrv.get(id);
  transfer.destroy({where: {id}});
  const transfers = await transferSrv.getAllByAccount(transfer.accountId);
  return accountSrv.rebalance(transfer.accountId, transfers);
};

module.exports = transferSrv;
