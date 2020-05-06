const sqliteDB = require('../database/sqlite')
const ParkingLotRepository = () => {

}

ParkingLotRepository.createParkingLot = (floor, position, size) => {
  let id = `F${floor}P${position}`
  let stmt = sqliteDB.GetDB().prepare('INSERT INTO parking_lot(id, floor, position, size) VALUES (?,?,?,?)');
  return new Promise((resolve, reject) => {
    stmt.run(id, floor, position, size, (err) => {
      if (err) {
        return reject(err)
      }
      stmt.finalize();
      return resolve({ id, floor, position, size, status: 'A' })
    })
  })
}

ParkingLotRepository.getParkingLotByID = (id) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT pl.id as id, pl.floor as floor, pl."position" as "position", pl."size", pl.status as status 
              FROM parking_lot pl WHERE pl.id = ?`
    sqliteDB.GetDB().get(sql, id, (err, row) => {
      if (err) {
        return reject(err)
      }
      return resolve(row)
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
      db.get(sqlCount, size, status, (err, row) => {
        if (err) {
          return reject(err)
        }
        count = row.c
      })

      db.all(sqlData, size, status, offset, limit, function (err, row) {
        if (err) {
          return reject(err)
        }
        return resolve({
          count,
          data: row
        })
      })
    });

  })
}

ParkingLotRepository.getFirstAvailableParkingLotBySize = (size) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT pl.id as id, pl.floor as floor, pl."position" as "position", pl."size", pl.status as status 
              FROM parking_lot pl 
              WHERE pl.size = ? AND pl.status = 'A'
              ORDER BY pl.floor, pl."position" LIMIT 1`
    sqliteDB.GetDB().get(sql, size, (err, row) => {
      if (err) {
        return reject(err)
      }
      return resolve(row)
    })
  })
}

ParkingLotRepository.getNumberOfAvailableParkingLotGroupByFloor = () => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT f.floor AS floor, fc.c AS "count"
      FROM 
        (
          SELECT DISTINCT pl1.floor AS floor 
          FROM parking_lot pl1
        ) f
      LEFT JOIN (
          SELECT pl2.floor AS floor, COUNT(pl2.id) AS c 
          FROM parking_lot pl2 
          WHERE pl2.status = 'A'  
          GROUP BY pl2.floor
        ) fc
      ON (f.floor = fc.floor)
      ORDER BY f.floor`
    sqliteDB.GetDB().all(sql, (err, rows) => {
      if (err) {
        return reject(err)
      }
      return resolve(rows)
    })
  })
}

module.exports = ParkingLotRepository;