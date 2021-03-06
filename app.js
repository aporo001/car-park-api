const express = require('express');
const path = require('path');
const logger = require('morgan');

const parkingLotRouter = require('./routes/parking-lot');
const parkingTicketRouter = require('./routes/ticket');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/parking-lot', parkingLotRouter);
app.use('/ticket', parkingTicketRouter);

module.exports = app;
