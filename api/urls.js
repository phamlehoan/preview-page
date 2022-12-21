const express = require('express');
const path = express.Router();

const pageRouter = require('./pages/urls')

path.use('/preview-page', pageRouter);

module.exports = path;
