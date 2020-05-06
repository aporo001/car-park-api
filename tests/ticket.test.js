const request = require('supertest')
const app = require('../app')
const sqliteDB = require('../database/sqlite')

describe('Parking lot Test', () => {
  beforeAll(() => {
    sqliteDB.InitDB()
  });

  afterAll((done) => {
    sqliteDB.Disconnect()
  });


  it('api 2 should create ticket to park the car', async () => {
    const res = await request(app)
      .post('/ticket/park-car')
      .send({
        "plate_number": "9กบ7777",
        "car_size": "S"
      })
    expect(res.statusCode).toEqual(200)
    
  })

  it('api 2 should can not create ticket to park the car when parking lot not available', async () => {
    const res = await request(app)
      .post('/ticket/park-car')
      .send({
        "plate_number": "9กบ7779",
        "car_size": "M"
      })
    expect(res.statusCode).toEqual(400)
    
  })

  it('api 2 should can not create ticket to park the car when plate number is parking', async () => {
    const res = await request(app)
      .post('/ticket/park-car')
      .send({
        "plate_number": "9กบ7777",
        "car_size": "S"
      })
    expect(res.statusCode).toEqual(400)
    
  })

  it('api 2 should can not create ticket to park the car when car size not in S,M,L', async () => {
    const res = await request(app)
      .post('/ticket/park-car')
      .send({
        "plate_number": "9กบ7777",
        "car_size": "K"
      })
    expect(res.statusCode).toEqual(400)
    
  })


  it('api 3 should leave the slot', async () => {
    const res = await request(app)
      .post('/ticket/leave-slot')
      .send({
        "ticket_id": 1
      })
    expect(res.statusCode).toEqual(200)
  })

  it('api 3 should can not leave the slot when ticket_id has left ', async () => {
    const res = await request(app)
      .post('/ticket/leave-slot')
      .send({
        "ticket_id": 1
      })
    expect(res.statusCode).toEqual(400)
  })

  it('api 3 should can not leave the slot when ticket_id not found ', async () => {
    const res = await request(app)
      .post('/ticket/leave-slot')
      .send({
        "ticket_id": 99
      })
    expect(res.statusCode).toEqual(400)
  })


  it('api 3 should can not leave the slot when ticket_id wrong format ', async () => {
    const res = await request(app)
      .post('/ticket/leave-slot')
      .send({
        "ticket_id": "99xx"
      })
    expect(res.statusCode).toEqual(400)
  })


  it('api 5 should get registration plate number list by car size', async () => {
    const res = await request(app)
      .get('/ticket/list-plate-number-by-car-size?car_size=S&page=1&limit=10')
      .send()
    expect(res.statusCode).toEqual(200)
  })

  it('api 5 should can not get registration plate number list by car size when not found data', async () => {
    const res = await request(app)
      .get('/ticket/list-plate-number-by-car-size?car_size=M&page=1&limit=10')
      .send()
    expect(res.statusCode).toEqual(404)
  })

  it('api 5 should can not get registration plate number list by car size when car size not in S,M,L', async () => {
    const res = await request(app)
      .get('/ticket/list-plate-number-by-car-size?car_size=K&page=1&limit=10')
      .send()
    expect(res.statusCode).toEqual(400)
  })

})