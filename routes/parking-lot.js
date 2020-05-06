const express = require('express')
const router = express.Router()
const { body, validationResult, query } = require('express-validator')
const parkingRepository = require('../repositories/parking-lot.repository')

//create parking lot
router.post('/', [
  body('floor')
    .isNumeric()
    .notEmpty(),
  body('position')
    .isNumeric()
    .notEmpty(),
  body('size')
    .isIn(['S', 'M', 'L'])
    .notEmpty()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  let floor = req.body.floor
  let position = req.body.position
  let size = req.body.size
  try {
    let data = await parkingRepository.createParkingLot(floor, position, size)
    return res.json(data)
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ errors: [{ msg: "floor and position is exist." }] })
    }
    return res.status(500).json({ errors: [{ msg: error.code }] })
  }
})

//get registration allocated slot number list by car size
router.get('/list-allocated-by-size', [
  query('page').isInt({ min: 1 }),
  query('limit').isInt({ min: 1, max: 30 }),
  query('size').isIn(['S', 'M', 'L']).notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  let page = parseInt(req.query.page)
  let limit = parseInt(req.query.limit)
  let offset = (page - 1) * limit
  let size = req.query.size
  try {
    let data = await parkingRepository.getParkingLotListBySizeAndStatus(size, 'N', offset, limit)
    if (data.count > 0) {
      let totalPage = Math.ceil(data.count / limit)
      return res.json({ page, limit, totalPage, ...data, })
    }
    return res.status(404).json({ errors: [{ msg: 'not found' }] })
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.code }] })
  }
})

//get parking lot by id (get status of parking lot)
router.get('/:id', async (req, res) => {
  try {
    let data = await parkingRepository.getParkingLotByID(req.params.id)
    if (data) {
      return res.json(data)
    }
    return res.status(404).json({ errors: [{ msg: 'not found' }] })
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.code }] })
  }
})




module.exports = router;
