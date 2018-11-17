/**
 * This has functions that will get/update/insert data from remote database
 * Created Sept. 2016, Larry A. Maddocks
 **/
/* global $, 
  jQuery,    Window,  Handlebars,idiagramSvg   */


var io = require('../socket.io-1.4.5.js');

//sets up the connection to socket.io as a promise. Probably not needed to be a promise, but
//I am trying to use the promise methods and generators.

io.connectAsync = (url, options) => {
  return new Promise((resolve, reject) => {
    //check to see if we are already connected
    if (dbIo.socket !== null && dbIo.socket.connected === true) {
      resolve(dbIo.socket); //use what we have
    }
    else {
      dbIo.socket = io.connect(url, options);
      dbIo.socket.on('connect', (e) => {

        resolve(dbIo.socket);
      });
      dbIo.socket.on('connect_error', (e) => {
        reject(new Error('connect_error: ' + e));
      });
      dbIo.socket.on('connect_timeout', (e) => {
        //TODO: Make this work if it doesn't
        reject(new Error('connect_timeout: ' + e));
      });
    }
  });
}


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

var connectToSocket = Promise.coroutine(function*() {
  if (dbIo.socket !== null && dbIo.socket.connected === true) {
    // resolve(dbIo.socket); //use what we have
    return new Promise((resolve, reject) => {
      resolve(dbIo.socket);
    });
  }
  else {
    dbIo.socket = yield io.connectAsync('/', {
      reconnection: false
    });

    //dbIo.socket = socket;
    // connected here
    console.log("Success connecting socket");
    dbIo.socket.emitAsync = function(event, msg) {
      return new Promise((resolve, reject) => {
        dbIo.socket.emit(event, msg);
        dbIo.socket.on('msg_response', (returnData) => {
          resolve(returnData);
        });
        dbIo.socket.on('event_msg_error', (err) => {
          reject(new Error('event_msg_error: ' + err));
        });
        //io.on('connect_timeout', function() {
        //TODO: Make this work if it doesn't
        // reject(new Error('connect_timeout'));
        //});
      });
    };


    return new Promise((resolve, reject) => {
      resolve(dbIo.socket);
    });
  }

});

var dbIo = {
  socket: null,
  connectToSocket: connectToSocket,
  io: io

  /*populateMapForm: populateMapForm,
  socket: null,
  setMapFormSubmitButtonEvent: setMapFormSubmitButtonEvent*/


};
module.exports = dbIo;