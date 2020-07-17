const databaseController = require('./databaseController');
const commonFunc = require('../commonFunc');

exports.balance = function(account) {
  console.log(account);
  return databaseController.checkAvailableBalance(account).then((amount) => {
    console.log(amount);
    return {
      amount
    };
  });
}

exports.deposit = function(data) {
  if (commonFunc.checkDataForDeposit(data)) {
    return module.exports.checkAllowedBanknotes(data.banknotes).then((allowed) => {
      if (allowed) {
        let bulkOp = data.banknotes.map((banknote) => {
          return { updateOne: {
            filter: { amount: Number(banknote.amount) },
            update: {'$inc': { value: Number(banknote.value) }},
            upsert:true
          }};
        });
        ////////////////////////////////
        return databaseController.generateStatement(data)
            .then((statement) => {
              return databaseController.bulkOp('Banknote', bulkOp)
                .then(() => {
                  return databaseController.upsert('Account', {
                    where: { account: data.targetAccount },
                    op: {'$inc': { balance: Number(data.amount) }}
                  });
                }).then((updatedAccount) => {
                  let amount = Number(updatedAccount.balance);
                  return databaseController.updateStatement(statement, amount);
                }).then((statement) => {
                  data.deposited = true;
                  data.statement = statement._id;
                  return data;
                });
            });
      } else {
        throw new Error('Banknote not allowed');
      }
    });
  } else {
    return Promise.reject(new Error('Invalid deposit'));
  }
}

exports.withdraw = function(data) {
  // checks if sent data is valid
  if (commonFunc.checkDataForWithdrawal(data)) {
    // checks if account has available balance
    return databaseController.checkAvailableBalance(data.account, Number(data.amount)).then((goodToGo) => {
      if (goodToGo) {
        // generates statement
        return databaseController.generateStatement(data).then((statement) => {
          // calculates and removes banknotes
          return withdrawBanknotes(Number(data.amount),Number(data.denomination)).then((results) => {
            // removes amount from account balance
            data.banknotes = results;
            return databaseController.upsert('Account', {
              where: { account: data.account },
              op: {'$inc': { balance: -1 * Number(data.amount) }}
            });
          }).then((updatedAccount) => {
            let amount = updatedAccount.balance;
            return databaseController.updateStatement(statement, amount);
          }).then(() => {
            data.success = true;
            return data;
          }).catch((e) => {
            console.log(e.stack);
            //rollback
            //save statement without returning promise
            throw e;
          });
        })
      } else {
          throw new Error('Insuficient balance');
      }
    });
  } else {
    return Promise.reject(new Error('Invalid withdraw'));
  }
}

exports.checkAllowedBanknotes = function(banknotes) {
  if (Array.isArray(banknotes)) {
    let parsedBanknotes = banknotes.map((banknote) => {
      return Number(banknote.amount);
    });
    return databaseController.getAllowedBanknotes(parsedBanknotes)
  } else {
    return databaseController.getAllowedBanknotes();
  }
}

function withdrawBanknotes(amount,denomination) {
  return databaseController.getAvailableNotes()
    .then((results) => {
      let noteamount = [];
      let value = [];
      for(let banknote of results) {
        if((denomination && denomination < banknote.amount) || banknote.value<=0) {
          continue;
        }
        noteamount.push(Number(banknote.amount));
        value.push(Number(banknote.value));
      }       
      return getMinimumBanknotes(noteamount, value, amount);
    })
    .then((minimum) => {
      console.log('minimum', minimum);
      if (minimum) {
        let bulkOp = Object.keys(minimum).map((banknote) => {
          return { updateOne: {
            filter: { amount: Number(banknote) },
            update: {'$inc': { value: (-1 * minimum[banknote]) }},
            upsert: true
          }};
        });
        return databaseController.bulkOp('Banknote', bulkOp)
        .then(() => {
          return minimum;
        });
      } else {
        throw new Error('Insufficient banknotes or Invalid banknotes calculation');
      }
    });
}

function getMinimumBanknotes(notes, count, amount) {
  console.log('notes', notes);
  console.log('count', count);
  console.log('amount', amount);
  let notesSize = notes.length; // different notes array
  let dp = new Array(amount + 1); // different possibilities array
  let result = new Array(amount + 1); // dp with notes array
  for (let i = 1; i <= amount + 1; i++) {
    dp[i] = Number.MAX_VALUE;
  }
  dp[0] = 0;
  var sum = 0;
  for (var i = 0; i < notesSize; i++) {
    sum += notes[i] * count[i];
    for (var j = notes[i]; j <= sum && j <= amount; j++) {
      if(dp[j] > dp[j - notes[i]] + 1) {
        dp[j] = dp[j - notes[i]] + 1;
        result[j] = Object.assign(result[j] || {}, result[j-notes[i]] || {});
        result[j][notes[i]] =
          (result[j-notes[i]] ? result[j-notes[i]][notes[i]] || 0 : 0 ) + 1;
      }
    }
  }
  
  let finalResult = result[amount];
  // final check
  if (finalResult) {
    for (var i = 0; i < notesSize; i++) {
      if (count[i] < finalResult[notes[i]])
        return false;
    }
    return finalResult;
  } else {
    return false;
  }
}