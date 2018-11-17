'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This has functions that will get/update/insert data from remote database
 * Created Sept. 2016, Larry A. Maddocks
 **/
/* global $, 
  jQuery,    Window,  Handlebars,idiagramSvg   */

var io = require('../socket.io-1.4.5.js');

//sets up the connection to socket.io as a promise. Probably not needed to be a promise, but
//I am trying to use the promise methods and generators.

io.connectAsync = function (url, options) {
  return new Promise(function (resolve, reject) {
    //check to see if we are already connected
    if (dbIo.socket !== null && dbIo.socket.connected === true) {
      resolve(dbIo.socket); //use what we have
    } else {
      dbIo.socket = io.connect(url, options);
      dbIo.socket.on('connect', function (e) {

        resolve(dbIo.socket);
      });
      dbIo.socket.on('connect_error', function (e) {
        reject(new Error('connect_error: ' + e));
      });
      dbIo.socket.on('connect_timeout', function (e) {
        //TODO: Make this work if it doesn't
        reject(new Error('connect_timeout: ' + e));
      });
    }
  });
};

//this calls io.connectAsync() to connect to the socket server, then  it
//adds some promise functions to socket, such as an emit a promise function
/*io.connectAsync('/', {
  reconnection: true
}).then((socket) => {
  dbIo.socket = socket;
  // connected here
  console.log("Success connecting socket");
  socket.emitAsync = function(event, msg) {
    return new Promise((resolve, reject) => {
      socket.emit(event, msg);
      socket.on('msg_response', (returnData) => {
        resolve(returnData);
      });
      socket.on('event_msg_error', (err) => {
        reject(new Error('event_msg_error: ' + err));
      });
      //io.on('connect_timeout', ()=> {
      //TODO: Make this work if it doesn't
      // reject(new Error('connect_timeout'));
      //});
    });
  }
}, function(err) {
  // error connecting here
  console.log("error connecting socket: " + err);
});*/

var connectToSocket = Promise.coroutine(_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(dbIo.socket !== null && dbIo.socket.connected === true)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt('return', new Promise(function (resolve, reject) {
            resolve(dbIo.socket);
          }));

        case 4:
          _context.next = 6;
          return io.connectAsync('/', {
            reconnection: false
          });

        case 6:
          dbIo.socket = _context.sent;


          //dbIo.socket = socket;
          // connected here
          console.log("Success connecting socket");
          dbIo.socket.emitAsync = function (event, msg) {
            return new Promise(function (resolve, reject) {
              dbIo.socket.emit(event, msg);
              dbIo.socket.on('msg_response', function (returnData) {
                resolve(returnData);
              });
              dbIo.socket.on('event_msg_error', function (err) {
                reject(new Error('event_msg_error: ' + err));
              });
              //io.on('connect_timeout', function() {
              //TODO: Make this work if it doesn't
              // reject(new Error('connect_timeout'));
              //});
            });
          };

          return _context.abrupt('return', new Promise(function (resolve, reject) {
            resolve(dbIo.socket);
          }));

        case 10:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this);
}));

var dbIo = {
  socket: null,
  connectToSocket: connectToSocket,
  io: io

  /*populateMapForm: populateMapForm,
  socket: null,
  setMapFormSubmitButtonEvent: setMapFormSubmitButtonEvent*/

};
module.exports = dbIo;