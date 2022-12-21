const express = require('express');
const path = express.Router();

const views = require('./views');

path.route('/').post(views.previewPage);

module.exports = path;
