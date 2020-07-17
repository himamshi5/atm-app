const apiController = require('../controllers/apiController');
const commonFunc = require('../commonFunc');
const constants = require('../constants');

exports.balance = function(req, res) {
  apiController.balance(req.query.account).then((result) => {
    if (result) {
      commonFunc.sendCustomResponse(res, constants.responseMessageCode.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, result);
    } else {
      throw new Error('Value not deposited. Unknown Error.');
    }
  }).catch((e) => {
    commonFunc.sendCustomResponse(res, constants.responseMessageCode.VALUE_NOT_DEPOSITED + ": "+ e, constants.responseFlags.DATA_NOT_FOUND, {});
  });
}

exports.deposit = function(req, res) {
  let parsedInput = commonFunc.parseInput(req);
  apiController.deposit(parsedInput).then((result) => {
    if (result.deposited) {
      commonFunc.sendCustomResponse(res, constants.responseMessageCode.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, 
        { amount: result.amount,
          banknotes: result.banknotes
        });
    } else {
      throw new Error('Value not deposited. Unknown Error.');
    } 
  }).catch((e) => {
    commonFunc.sendCustomResponse(res, constants.responseMessageCode.VALUE_NOT_DEPOSITED + ": "+ e, constants.responseFlags.DATA_NOT_FOUND, {});
  });
}

exports.withdraw = function(req, res) {
  let parsedInput = commonFunc.parseInput(req);
  apiController.withdraw(parsedInput).then((result) => {
    if (result.success) {
      commonFunc.sendCustomResponse(res, constants.responseMessageCode.ACTION_COMPLETE, constants.responseFlags.ACTION_COMPLETE, 
        { amount: result.amount,
          banknotes: result.banknotes
        });
    } else {
      throw new Error('Value not deposited. Unknown Error.');
    }
  }).catch((e) => {
    commonFunc.sendCustomResponse(res, constants.responseMessageCode.VALUE_NOT_DEPOSITED +": "+ e, constants.responseFlags.DATA_NOT_FOUND, {});
  });
}
