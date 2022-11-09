const express = require('express');
const path = express.Router();

const httpRouter = require('../http/urls');
const apiRouter = require('../api/urls');

path.use('/', httpRouter);
path.use('/api', apiRouter);

module.exports = path;
