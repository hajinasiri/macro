var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
//var socketio = require('socket.io');
//var passportSocketIo = require('passport.socketio');

var userService = require('../services/user-service');
var config = require('../config');
var mongoose = require('mongoose');
var nev = require('./email-verification')(mongoose);
//var app = require('../app.js');

// our persistent user model
var User = require('../models/user').User;

// sync version of hashing function
var myHasher = function(password, tempUserData, insertTempUser, callback) {
  var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  return insertTempUser(hash, tempUserData, callback);
};

// async version of hashing function
myHasher = function(password, tempUserData, insertTempUser, callback) {
  bcrypt.genSalt(8, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      return insertTempUser(hash, tempUserData, callback);
    });
  });
};

// NEV configuration =====================
nev.configure({
  persistentUserModel: User,
  expirationTime: 600, // 10 minutes

  verificationURL: config.verificationURL,
  // transportOptions: {
  // // service: 'Gmail',
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   auth: {
  //     user: 'slidetrip',
  //     pass: passwd
  //   }
  // },
  verifyMailOptions: {
    from: config.from,
    subject: 'Confirm your account',
    html: '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
      'paste the following link into your browser:</p><p>${URL}</p>',
    text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
  },
  confirmMailOptions: {
    from: config.from,
    subject: 'Successfully verified!',
    html: '<p>Your account has been successfully verified.</p>',
    text: 'Your account has been successfully verified.'
  },

  hashingFunction: myHasher,
  passwordFieldName: 'password',
}, function(err, options) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('configured: ' + (typeof options === 'object'));
});

nev.generateTempUserModel(User, function(err, tempUserModel) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/create', function(req, res, next) {
  var vm = {
    title: 'Create an account'
  };
  res.render('users/create', vm);
});

router.get('/message', function(req, res, next) {
  var vm = {
    title: 'Email Verification Sent'
  };
  res.render('users/message', vm);
});

router.post('/create', function(req, res, next) {
  // register button was clicked
  // if (req.body.type === 'register') {
  //var password = req.body.password;
  var email = req.body.email;
  var newUser = new User(req.body);

  nev.createTempUser(newUser, function(err, newTempUser) {
    if (err) {
      //return res.status(404).send('ERROR: creating temp user FAILED');

      var vm = {
        title: 'Error',
        message: 'ERROR: creating temp user FAILED'
      };
      return res.render('users/message', vm);
    }

    // new user created
    if (newTempUser) {
      var URL = newTempUser[nev.options.URLFieldName];

      nev.sendVerificationEmail(email, URL, function(err, info) {
        
        /*if (err) {
          return res.status(404).send('ERROR: sending verification email FAILED. err: ' + err);
        }*/

        if (err) {
          //return res.status(404).send('ERROR: creating temp user FAILED');
          var vm = {
            title: 'Error: verification email',
            message: 'ERROR: sending verification email FAILED. err: ' + err
          };
          return res.render('users/message', vm);
        }

        // res.json({
        //   msg: 'An email has been sent to you. Please check it to verify your account.',
        //   info: info
        // });


        var vm = {
          title: 'Email Verify',
          message: 'An email has been sent to you. Please check it to verify your account.'
        };
        // req.flash('error', 'An email has been sent to you. Please check it to verify your account.')
        // res.render('users/create', { error: req.flash('An email has been sent to you. Please check it to verify your account.') });
        //  res.redirect('message');
        res.render('users/message', vm);

      });

      // user already exists in temporary collection!
    }
    else {
      var vm = {
        title: 'Already Signed up',
        message: 'You have already signed up. Please check your email to verify your account.'
      };
      res.render('users/message', vm);
    }
  });

  // resend verification button was clicked
  // }
  /* else {
     nev.resendVerificationEmail(email, function(err, userFound) {
       if (err) {
         return res.status(404).send('ERROR: resending verification email FAILED');
       }
       if (userFound) {
         res.json({
           msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
         });
       }
       else {
         res.json({
           msg: 'Your verification code has expired. Please sign up again.'
         });
       }
     });
   } */

  /*
  userService.addUser(req.body, function(err) {
    if (err) {
      console.log(err);
      var vm = {
        title: 'Create an account',
        input: req.body,
        error: err
      };
      delete vm.input.password;
      return res.render('users/create', vm);
    }
    req.login(req.body, function(err) {
      res.redirect('/home');
    });
  });  */
});

// user accesses the link that is sent
router.get('/email-verification/:URL', function(req, res) {
  var url = req.params.URL;

  nev.confirmTempUser(url, function(err, user) {
    if (user) {
      nev.sendConfirmationEmail(user.email, function(err, info) {
        if (err) {
          var vm = {
            title: 'Error: verification email',
            message: 'ERROR: sending verification email FAILED. err: ' + err
          };
          return res.render('users/message', vm);
        }
        /*res.json({
          msg: 'CONFIRMED!',
          info: info
        });*/
        req.login(req.body, function(err) {
          res.redirect('/home');
        });

      });
    }
    else {
      console.log(err);
      var vm = {
        title: 'Create an account',
        input: req.body,
        error: err
      };
      delete vm.input.password;
      return res.render('users/create', vm);

      // return res.status(404).send('ERROR: confirming temp user FAILED');
    }
  });
});

router.post('/login',
  function(req, res, next) {
    //req.session.orderId = 12345; //this looks like it is left over from tutorial code. TODO: get rid of this!!!
    if (req.body.rememberMe) {
      req.session.cookie.maxAge = config.cookieMaxAge;
    }
    next();
  },
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/home',
    failureFlash: 'Invalid credentials'
  }));

router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//I don't see this being used anywhere
// router.post('/submitform',
//   function(req, res, next) {
//     if (!req.isAuthenticated()) {
//       return res.redirect('/');
//     }
//     var vm = {
//           title: 'Posted Stuff',
//           message: 'We got your submission. Thank you'
//         };
//         // req.flash('error', 'An email has been sent to you. Please check it to verify your account.')
//         // res.render('users/create', { error: req.flash('An email has been sent to you. Please check it to verify your account.') });
//         //  res.redirect('message');
//         res.render('users/message', vm);
//   }
//   //Now insert this into database
  
//   );
  
 /*
  //TODO: Take this out if we are using socket submit
  router.post('/submitmapdb',
  function(req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect('/');
    }
   /var vm = {
          title: 'Posted Map DB Stuff',
          message: 'We got your map db update submission. Thank you'
        };
        // req.flash('error', 'An email has been sent to you. Please check it to verify your account.')
        // res.render('users/create', { error: req.flash('An email has been sent to you. Please check it to verify your account.') });
        //  res.redirect('message');
        res.render('users/message', vm);
        
        
  }
  //Now insert this into database
  
  );
*/
/*
var eventSocket = app.locals.io.of('/submitmapdb');
// on connection event
eventSocket.on('connection', function(socket) {

  // example 'event1', with an object. Could be triggered by socket.io from the front end
  socket.on('event1', function(eventData) {
      // user data from the socket.io passport middleware
    if (socket.request.user && socket.request.user.logged_in) {
      console.log(socket.request.user);
    }
  });
});
*/

module.exports = router;
