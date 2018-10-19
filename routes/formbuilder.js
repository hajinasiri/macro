//this will open the form builder app that will allow designer to create a form, then save the json to the server
var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict')


router.get('/', restrict, function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  //now look to see if user permissions contain admin
  var permissions = req.user._doc.doc.permissions;
  if (!((permissions.split(',').indexOf('admin') > -1) || (permissions.split(',').indexOf('designer') > -1))) {
  //  return res.redirect('/'); // not found
    let vm = {
        title: 'Permission Error',
        message: 'User does not have permission to use formbuilder'
      };
      console.error('User does not have permission to use formbuilder');
      res.render('users/message', vm);
  }
   let vm = {
          layout: 'simpleLayout',
          messageTitle: '',
          serverMessage: ''
        };
        res.render('formbuilder/index', vm);
    

});


module.exports = router;