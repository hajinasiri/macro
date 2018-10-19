var express = require('express');
var router = express.Router();
var path = require('path');


//router.use(express.static('/var/www/idiagram/public'));
router.use(express.static(path.join(__dirname, '../public')));


router.get('/:file', function(req, res, next) {
  var fileName = req.params.file;
  console.log("file Sent in: " + fileName);
  //console.log('%s %s %s', req.method, req.url, req.path);  
  res.sendFile( fileName, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
});



module.exports = router;
