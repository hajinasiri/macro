var express = require('express');
var router = express.Router();
var restrict = require('../auth/restrict')
// view engine setup
//router.set('views', path.join(__dirname, 'admin'));
var userService = require('../services/user-service');

router.get('/', restrict, function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  //now look to see if user permissions contain admin
  var permissions = req.user._doc.doc.permissions;
  if (!(permissions.split(',').indexOf('admin') > -1)) {
    return res.redirect('/'); // not found
  }
  userService.findAllUers(req, res, function(err, data) {
    if (err) {
      console.error(err);
      res.redirect('/error');
    }
    else {
      let numberOfUsers = data.length;
      // Here is what our structure looks like in index.hbs:
      // {{#each instances}}
      // <tr>
      //   <td>{{firstName}}</td>
      //   <td>{{lastName}}</td>
      //   <td>{{email}}</td>
      //   <td>{{permissions}}</td>
      //   <td>{{folders}}</td>
      // </tr>
      // {{/each}}
      if (numberOfUsers) {
        let instancesArray = [];
        for (var i = 0; i < numberOfUsers; i++) {
          data[i]._doc.doc = data[i]._doc.doc == undefined ? {} : data[i]._doc.doc;
          var o = {
            rowId: i,
            firstName: data[i]._doc.firstName,
            lastName: data[i]._doc.lastName,
            email: data[i]._doc.email,
            collections: data[i]._doc.doc.hasOwnProperty("collections") ? data[i]._doc.doc.collections : "",
            permissions: data[i]._doc.doc.permissions,
            folders: data[i]._doc.doc.folders
          };
          instancesArray.push(o);
        }

        let vm = {
          title: 'Admin',
          instances: instancesArray,
          layout: 'simpleLayout',
          messageTitle: 'Sucess',
          serverMessage: 'Success getting all users.'
        };
        res.render('admin/index', vm);
      }
      else {
        console.error(err);
        let vm = {
          messageTitle: 'Error',
          serverMessage: err
        };
        res.render('admin/index', vm);
      }
    }
  });

});

router.post('/updateuser', function(req, res, next) {
  // register button was clicked
  // if (req.body.type === 'register') {
  //var password = req.body.password;
  // var email = req.body.email;
  // var newUser = new User(req.body);
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  var permissions = req.user._doc.doc.permissions;
  if (!(permissions.split(',').indexOf('admin') > -1)) {
    let vm = {
      messageTitle: 'Permission Denied',
      serverMessage: 'You do not have permission to perform this function.'
    };
    
    res.render('admin/index', vm);
  }
  var data = req.body;
  userService.updateRow(data.id, data.doc, (err, status) => {
    if (err) {
      //console.error(err);
      var vm = {
        title: 'Error updating',
        message: 'ERROR: Updating user failed. Error: ' + err + "id: " + data.id
      };
      console.error('error in updateRow for user: ' + err + "id: " + data.id);
      res.render('users/message', vm);
      //res.redirect('users/message', vm);
    }
    else {
      let vm = {
        messageTitle: 'Sucess',
        serverMessage: 'Success updating user: ' + data.id
      };
      //res.render('admin/index', vm);
      res.status(status).send(vm);

      console.log('success in updateRow for user: ' + status + "id: " + data.id);
    }
  });
});

router.post("/delete/:id", function(req, res, next) {
  // register button was clicked
  // if (req.body.type === 'register') {
  //var password = req.body.password;
  // var email = req.body.email;
  // var newUser = new User(req.body);
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  var id = req.params.id;

  userService.deleteRow(id, (err, status) => {
    if (err) {
      //console.error(err);
      var vm = {
        title: 'Error deleting',
        message: 'ERROR: Deleting user failed. Error: ' + err + "id: " + id
      };
      console.error('error in deleteRow for user: ' + err + "id: " + id);
      res.render('users/message', vm);
      //res.redirect('users/message', vm);
    }
    else {
      let vm = {
        messageTitle: 'Success',
        serverMessage: 'Success deleting user: ' + id
      };
      //res.render('admin/index', vm);
      res.status(status).send(vm);

      console.log('success in deleteRow for user: ' + status + "id: " + id);
    }
  });
});

module.exports = router;
