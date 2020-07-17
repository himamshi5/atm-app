const joi = require('joi');
const commonFunc = require('../commonFunc');
const constants = require('../constants');

exports.deposit = (req, res, next) => {
    const Schema = joi.object().keys({
     targetAccount: joi.string().required(),
     amount: joi.number().required(),
     banknotes: joi.array().required()
    });
   
    let validation = Schema.validate(req.body);
    if (validation.error) {
        commonFunc.sendCustomResponse(res, constants.responseMessageCode.VALIDATION_ERROR, constants.responseFlags.VALIDATION_ERROR, {});
    }
    next();
};

exports.withdraw = (req, res, next) => {
    const Schema = joi.object().keys({
     amount: joi.number().required(),
     denomination: joi.number().optional(),
     account: joi.string().required(),
    });
   
    let validation = Schema.validate(req.body);
    if (validation.error) {
        commonFunc.sendCustomResponse(res, constants.responseMessageCode.VALIDATION_ERROR, constants.responseFlags.VALIDATION_ERROR, {});
    }
    next();
};