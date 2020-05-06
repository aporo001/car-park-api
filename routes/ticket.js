const express = require('express')
const router = express.Router()
const { body, validationResult, query } = require('express-validator')
const parkingTicketRepository = require('../repositories/parking-ticket.repository')

router.post('/park-car', [
  body('plate_number').notEmpty().trim(),
  body('car_size').isIn(['S', 'M', 'L'])
  .notEmpty()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  let plateNo = req.body.plate_number
  let carSize = req.body.car_size
  try {
    let data = await parkingTicketRepository.parkingCar(plateNo, carSize)
    return res.json(data)
  } catch (error) {
    if (error.code === 'PARKING_NOT_FOUND' || error.code === 'CAR_IS_PARKING') {
      return res.status(400).json({ errors: [{ msg: error }] })
    }
    return res.status(500).json({ errors: [{ msg: error.code }] })
  }
})

router.post('/leave-slot', [
  body('ticket_id').notEmpty().isInt()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    let data = await parkingTicketRepository.leave(req.body.ticket_id)
    return res.json(data)
  } catch (error) {
    if (error.code === 'TICKET_NOT_FOUND' || error.code === 'WRONG_TICKET_STATUS') {
      return res.status(400).json({ errors: [{ msg: error }] })
    }
    return res.status(500).json({ errors: [{ msg: error.code }] })
  }
})

router.get('/list-plate-number-by-car-size', [
  query('page').isInt({ min: 1 }),
  query('limit').isInt({ min: 1, max: 100 }),
  query('car_size').isIn(['S', 'M', 'L']).notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  let page = parseInt(req.query.page)
  let limit = parseInt(req.query.limit)
  let offset = (page - 1) * limit
  let size = req.query.car_size
  try {
    let data = await parkingTicketRepository.getPlateNumberListByCarSize(size, offset, limit)
    if (data.count > 0) {
      let totalPage = Math.ceil(data.count / limit)
      return res.json({ page, limit, totalPage, ...data })
    }
    return res.status(404).json({ errors: [{ msg: 'not found' }] })
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.code }] })
  }
})

module.exports = router;