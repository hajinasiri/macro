var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.user) {
    return res.redirect('/home');
    //return next();
  }
//
  // GET Original URL
  //   router.get('/', function(req, res, next) {
  //       console.log('testing')
  //       if (req.user) {
  //
  //           return res.redirect(req.url);
  //           //return next();
  //       }

  var vm = {
    title: 'Login',
    error: req.flash('error')
  };
  res.render('login', vm);
});

/* GET home page. */


module.exports = router;
