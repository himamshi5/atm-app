exports.parseInput = (req) => {
  // TODO validate
  return req.body;
}

exports.sendCustomResponse = (res, message, code, data) => {
  let response = {
    message: message,
    status : code,
    data   : data || {},
  };
  res.send(JSON.stringify(response));
}


exports.checkDataForDeposit = (data) => {
  return !Number.isNaN(Number(data.amount)) &&
    Array.isArray(data.banknotes) &&
    data.targetAccount &&
    Number(data.amount) === (data.banknotes.reduce((sum, note) => {
      return sum + (Number(note.value) || 0) * (Number(note.amount) || 0);
      }, 0));
}

exports.checkDataForWithdrawal = (data) => {
  return !Number.isNaN(Number(data.amount)) && data.account;
}