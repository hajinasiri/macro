var express = require('express');
var router = express.Router();
//var multer = require("multer");
var fs = require('fs');
//uncomment out this if you end up using this. Also need fixing up since we updated multer
// router.use(multer({
//     dest : './public/svgs',
//     rename : function(fieldname, filename, req, res) {
//         //console.log('change name');
//         return "mysvg";
//     }
// }));
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('importSpread', {
        title : 'Import Data or SVG'
    });
});

//after posting a svg file to upload, which will be saved in this folder
router.post('/', function(req, res) {
    //console.log(req.body);
    // form fields
    //console.log(req.files);
    // form files

    var filePath = req.files.image.path;
    if (req.files && req.files.image && req.files.image.path) {
        //console.log("file path here: " + filePath);

        /*   var mysvg = "mysvg.svg";
         fs.rename(req.files.image.path, req.files.image + mysvg, function(err) {
         if (err)
         throw err;

         console.log('renamed complete: ');
         });
         */
        res.status(204).end();
        //res.status(200).end();
        //res.render('import', vm);

    }

});

module.exports = router;
