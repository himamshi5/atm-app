const MongoClient = require('mongodb').MongoClient;

var db = undefined;
exports.database = {
  getDb,
  create,
  update,
  find,
  bulkOp
};

function initialize() {
  return new Promise((resolve, reject) =>{
    MongoClient.connect('mongodb://localhost:27017/atm', function (err, conn) {
      if (err) {
        return reject(err);
      }
      return resolve(conn);
    });
  });
}
async function getDb() {
  if (!db) {
    //use fixed db for now
    db = (await initialize()).db('atm');
  }
  return Promise.resolve(db);
}

function create(collectionName, data, options) {
  return getDb().then((db) => {
    return db.collection(collectionName).insertOne(data, options);
  });
}

function find(collectionName, data, options, extraOptions) {
  return getDb().then((db) => {
    if(extraOptions) {
      return db.collection(collectionName).find(data, options).sort({extraOptions : -1}).toArray();
    }
    return db.collection(collectionName).find(data, options).toArray();
  });
}

function update(collectionName, query, op, options) {
  return getDb().then((db) => {
    return db.collection(collectionName).updateOne(query, op, options);
  });
}

function bulkOp(collectionName, bulkOp, options) {
  return getDb().then((db) => {
    return db.collection(collectionName).bulkWrite(bulkOp, options);
  });
}