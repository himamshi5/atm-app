const mongoConfig = require('../database/mongo'); 

exports.generateStatement = (data) => {
  return mongoConfig.database.create('Statement', data);
}

exports.updateStatement = (statement, amount) => {
  return mongoConfig.database.update(
    'Statement',
    { _id: statement['_id'] },
    { $set: {newBalance: amount} }
  );
}

exports.upsert = (collection, op) => {
  return mongoConfig.database.update(collection, op.where, op.op, {upsert: true});
}

exports.bulkOp = (collection, bulkOp) => {
  return mongoConfig.database.bulkOp(collection, bulkOp);
}

exports.getAllowedBanknotes = (banknotes) => {
  return mongoConfig.database.find('Banknote',
    { notAllowed: {'$ne': true} })
    .then((results) => {
      results = results.map((note) => {
        return Number(note.amount);
      });
      if (Array.isArray(banknotes)) {
       let b = banknotes.every((banknote) => {
        return results.includes(banknote);
      });
      return banknotes.every((banknote) => {
        return results.includes(parseInt(banknote));
      });
      } else {
        return results;
      }
    });
}

exports.withdrawBanknotes = (data) => {
  let bulkOp = data.banknotes.map((banknote) => {
    return { updateOne: {
      filter: { amount: banknote.amount },
      update: {'$inc': { value: banknote.value }},
      upsert: true
    }};
  });
}

exports.checkAvailableBalance = (account, amount) => {
  return mongoConfig.database.find('Account',
    { account: account })
    .then((results) => {
      if (amount > 0 && Array.isArray(results) && results[0]) {
        return amount <= results[0].balance;
      } else if (amount === undefined) {
        return results[0].balance;
      } else {
        throw new Error('Invalid account');
      }
    });
}

exports.getAvailableNotes = () => {
  return mongoConfig.database.find('Banknote', {},'amount');
}