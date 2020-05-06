const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE foo (id INT, txt TEXT)");
  var stmt = db.prepare("INSERT INTO foo VALUES(?, ?)");
  stmt.run(1, "demo", function (err) { 
    if (err) throw err;
    console.log(this);
    console.log(this.lastID);
    console.log('lastID', this.lastID);
  });
});
