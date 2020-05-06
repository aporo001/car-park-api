const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbPath = path.resolve(__dirname, '..', 'storage', 'carpark.db')

const SqliteDB = () => {
};

SqliteDB.GetDB = () => {
  if (typeof SqliteDB.db === 'undefined') {
    SqliteDB.InitDB()
  }
  return SqliteDB.db
}


SqliteDB.InitDB = () => {
  if(process.env.NODE_ENV === 'test') {
    SqliteDB.db = new sqlite3.Database(':memory:');
    SqliteDB.db.exec(`
    CREATE TABLE parking_lot (
      id TEXT(16) NOT NULL,
      floor INTEGER NOT NULL,
      "position" INTEGER NOT NULL,
      "size" TEXT(4) NOT NULL,
      status TEXT(4) DEFAULT A NOT NULL
    );
    
    CREATE UNIQUE INDEX parking_lot_id_IDX ON parking_lot (id);
    CREATE INDEX parking_lot_status_IDX ON parking_lot (status);
    CREATE INDEX parking_lot_size_IDX ON parking_lot ("size");`)
  } else {
    SqliteDB.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, function (err) {
      if (err) {
        console.error(err, ' create db error')
        process.exit(1);
      }
    })
  }
 
}

SqliteDB.Disconnect = () => {
  if (SqliteDB.db) {
    SqliteDB.db.close();
  }
  console.log('DB Disconnected')
}

module.exports = SqliteDB;