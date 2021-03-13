var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Main' });
});

router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Test'});
});

router.get('/heehit', function(req, res, next) {
  res.render('heehit', { title: 'HEEHIT'});
});

router.get('/try', function(req, res, next) {
  res.render('try', { des: 'Try'});
});

module.exports = router;
