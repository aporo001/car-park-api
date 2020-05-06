const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbPath = path.resolve(__dirname, '..', 'storage', 'carpark.db')

const SqliteDB = () => {
};

SqliteDB.GetDB = () => {
  if (typeof SqliteDB.db === 'undefined') {
    SqliteDB.InitDB();
  }
  return SqliteDB.db;
}


SqliteDB.InitDB = () => {
  SqliteDB.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, function (err) {
    if (err) {
      console.error(err, ' create db error');
      process.exit(1);
    }
  })
}

SqliteDB.Disconnect = () => {
  if (SqliteDB.db) {
    SqliteDB.db.close();
  }
  console.log('DB Disconnected');
}

module.exports = SqliteDB;