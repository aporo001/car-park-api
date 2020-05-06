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

  it('api 1 should create a new parking lot', async () => {
    const res = await request(app)
      .post('/parking-lot')
      .send({
        "size": "S",
        "floor": 1,
        "position": 1
      })
    expect(res.statusCode).toEqual(200)
  })

  it('api 1 should not create a new parking lot when floor and position dupicated', async () => {
    const res = await request(app)
      .post('/parking-lot')
      .send({
        "size": "S",
        "floor": 1,
        "position": 1
      })
    expect(res.statusCode).toEqual(400)
  })

  it('api 1 should not create a new parking lot when size not in S,M,L', async () => {
    const res = await request(app)
      .post('/parking-lot')
      .send({
        "size": "A",
        "floor": 1,
        "position": 1
      })
    expect(res.statusCode).toEqual(400)
  })

  it('api 4 should can get parking lot detail by id', async () => {
    const res = await request(app)
      .get('/parking-lot/F1P1')
      .send()
    expect(res.statusCode).toEqual(200)
  })

  it('api 4 should can not get parking lot detail by id when id not exist', async () => {
    const res = await request(app)
      .get('/parking-lot/F1P3')
      .send()
    expect(res.statusCode).toEqual(404)
  })

  it('api 6 should can get parking lot allocated list by size', async () => {
    const res = await request(app)
      .get('/parking-lot/list-allocated-by-size?size=S&page=1&limit=10')
      .send()
    expect(res.statusCode).toEqual(200)
  })

  it('api 6 should can not get parking lot allocated list by size when no data', async () => {
    const res = await request(app)
      .get('/parking-lot/list-allocated-by-size?size=M&page=1&limit=10')
      .send()
    expect(res.statusCode).toEqual(404)
  })

  it('api 6 should can not get parking lot allocated list by size when size not in S,M,L', async () => {
    const res = await request(app)
      .get('/parking-lot/list-allocated-by-size?size=A&page=1&limit=10')
      .send()
    expect(res.statusCode).toEqual(400)
  })

  it('api 7 should can get number of parking available group by floor', async () => {
    const res = await request(app)
      .get('/parking-lot/count-parking-lot-available-group-by-floor')
      .send()
    expect(res.statusCode).toEqual(200)
  })
})