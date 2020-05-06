const sqliteDB = require('../database/sqlite')
const ParkingLotRepository = () => {

}

ParkingLotRepository.createParkingLot = (floor, position, size) => {
  let id = `F${floor}P${position}`
  let stmt = sqliteDB.GetDB().prepare('INSERT INTO parking_lot(id, floor, position, size) VALUES (?,?,?,?)');
  return new Promise((resolve, reject) => {
    stmt.run(id, floor, position, size, function(err) {
      if(err) {
        reject(err)
      }
      stmt.finalize();
      resolve(id)
    }) 
  })
}

ParkingLotRepository.getParkingLotByID = (id) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT pl.id as id, pl.floor as floor, pl."position" as "position", pl."size", pl.status as status 
              FROM parking_lot pl WHERE pl.id = ?`
    sqliteDB.GetDB().get(sql, id, function(err, row) {
      if(err) {
        reject(err)
      }
      resolve(row)
    }) 
  })
}

ParkingLotRepository.getParkingLotListBySizeAndStatus = (size, status, offset, limit = 10) => {
  return new Promise((resolve, reject) => {
    let sqlWhere = `FROM parking_lot pl WHERE pl.size = ? AND pl.status = ?`
    let sqlOrderLimit = `ORDER BY pl.floor, pl."position" LIMIT ?, ?`
    let sqlCount = `SELECT COUNT(pl.id) as c ${sqlWhere}` 
    let sqlData = `SELECT pl.id as id, pl.floor as floor, pl."position" as "position", pl."size", pl.status as status ${sqlWhere} ${sqlOrderLimit}`
    const db = sqliteDB.GetDB()
    let count = 0
    db.serialize(() => {
      db.get(sqlCount, size, status, function(err, row) {
        if(err) {
          reject(err)
        }
        count = row.c
      }) 

      db.all(sqlData, size, status, offset, limit, function(err, row) {
        if(err) {
          reject(err)
        }
        resolve({
          count,
          data: row
        })
      }) 
    });
   
  })
}


module.exports = ParkingLotRepository;