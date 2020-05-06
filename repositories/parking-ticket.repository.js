const sqliteDB = require('../database/sqlite')
const moment = require('moment');

const parkingLotRepository = require('./parking-lot.repository')

const ParkingTicketRepository = () => {

}

ParkingTicketRepository.parkingCar = (plateNo, carSize) => {
  return new Promise(async (resolve, reject) => {
    //chack car not parking
    try {
      let checkTicket = await ParkingTicketRepository.getFirstTicketByPlateNoAndStatus(plateNo, 'P')
      if (checkTicket) {
        let error = new Error("car is parking");
        error.code = "CAR_IS_PARKING";
        return reject(error)
      }
    } catch (error) {
      return reject(error)
    }

    //get parking lot Available
    let parkingLot
    try {
      parkingLot = await parkingLotRepository.getFirstAvailableParkingLotBySize(carSize)
    } catch (error) {
      return reject(error)
    }

    if (!parkingLot) {
      let error = new Error("parking not available");
      error.code = "PARKING_NOT_FOUND";
      return reject(error)
    }

    const db = sqliteDB.GetDB()
    db.serialize(() => {
      const updateParkingLotSql = `UPDATE parking_lot
                                SET status='N'
                                WHERE id=?`

      const createParkingTicketSql = `INSERT INTO parking_ticket
                                  (parking_lot_id, plate_number, car_size, date_in, status)
                                  VALUES(?, ?, ?, ?, 'P')
                                  `
      let now = moment().format()
      db.exec('BEGIN TRANSACTION')
      db.run(updateParkingLotSql, parkingLot.id, (err) => {
        if (err) {
          db.exec('ROLLBACK')
          return reject(err)
        }
      })
      db.run(createParkingTicketSql, [parkingLot.id, plateNo, carSize, now], function (err) {
        if (err) {
          db.exec('ROLLBACK')
          return reject(err)
        }
        db.exec('COMMIT')
        return resolve({
          id: this.lastID,
          parking_lot_id: parkingLot.id,
          plate_number: plateNo,
          car_size: carSize,
          date_in: now,
          status: 'P'
        })
      })
    });
  })
}

ParkingTicketRepository.getFirstTicketByPlateNoAndStatus = (plateNo, status) => {

  return new Promise((resolve, reject) => {
    let sql = `SELECT id 
    FROM parking_ticket pt
    WHERE pt.plate_number = ? AND pt.status = ?
    LIMIT 1`
    sqliteDB.GetDB().get(sql, plateNo, status, (err, row) => {
      if (err) {
        return reject(err)
      }
      return resolve(row)
    })
  })
}

ParkingTicketRepository.leave = (ticketID) => {
  return new Promise(async (resolve, reject) => {
    //check ticket 
    let ticket
    try {
      ticket = await ParkingTicketRepository.getTicketByID(ticketID)
    } catch (error) {
      return reject(error)
    }

    if (!ticket) {
      let error = new Error("ticket not found ");
      error.code = "TICKET_NOT_FOUND";
      return reject(error)
    }

    if (ticket.status !== 'P') {
      let error = new Error("wrong ticket status");
      error.code = "WRONG_TICKET_STATUS";
      return reject(error)
    }

    const db = sqliteDB.GetDB()
    let now = moment().format()
    db.serialize(() => {
      const updateParkingLotSql = `UPDATE parking_lot
                                SET status = 'A'
                                WHERE id = ?`

      const updateParkingTicketSql = `UPDATE parking_ticket
                                      SET status = 'L', date_out=?
                                      WHERE id = ?`
      db.exec('BEGIN TRANSACTION')
      db.run(updateParkingLotSql, ticket.parking_lot_id, (err) => {
        if (err) {
          db.exec('ROLLBACK')
          return reject(err)
        }
      })
      db.run(updateParkingTicketSql, now, ticket.id, (err) => {
        if (err) {
          db.exec('ROLLBACK')
          return reject(err)
        }
        db.exec('COMMIT')
        return resolve({
          ...ticket,
          status: 'L',
          date_out: now
        })
      })

    });
  })
}

ParkingTicketRepository.getTicketByID = (id) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT id, parking_lot_id, plate_number, car_size, date_in, date_out, status
              FROM parking_ticket
              WHERE id = ?
    `
    sqliteDB.GetDB().get(sql, id, (err, row) => {
      if (err) {
        return reject(err)
      }
      return resolve(row)
    })
  })
}

ParkingTicketRepository.getPlateNumberListByCarSize = (carSize, offset, limit = 100) => {
  return new Promise((resolve, reject) => {
    let sqlWhere = `FROM parking_ticket pt WHERE pt.car_size = ?`
    let sqlOrderLimit = `ORDER BY pt.plate_number LIMIT ?, ?`
    let countSql = `SELECT COUNT(DISTINCT pt.plate_number) as c ${sqlWhere}`
    let dataSql = `SELECT DISTINCT pt.plate_number AS plate_number ${sqlWhere} ${sqlOrderLimit}`
    const db = sqliteDB.GetDB()
    db.serialize(() => {
      db.get(countSql, carSize, (err, row) => {
        if (err) {
          return reject(err)
        }
        count = row.c
      })

      db.all(dataSql, carSize, offset, limit, function (err, row) {
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

module.exports = ParkingTicketRepository

