var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('site/index', {
    path: 'settings.js',
    style: 'style.css',
    renderingclient: 'renderingClient.js',
    title: 'Express',
    container:[{name:'hello'}]});
});

module.exports = router;
