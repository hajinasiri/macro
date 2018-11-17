//Handles client-side socket io. Sends and receives.  All societ io goes through this. Created 2016, Larry A. Maddocks

/* global $, jQuery,idiagramSvg, io */
var socketCommands = null; //*** PUT THIS BACK AFTER YOU GET A https version io.connect('http://45.55.23.31:3201'); //TODO: create config.js and require it here and set this connect value from config.js
//var socketCommands = io.connect();
function emitCommandsForUrl(msg) {
  if (idiagramSvg.messageServer === true) {
    //make sure we don't send down a masteron command.
    //TODO: I could filter out just the masteron command and send the others.
    if (!$.address.parameter("masteron")) {//(!idiagramSvg.isKeyInParameterList(msg, ["masteron"])) {
     // ***PUT THIS BACK IN!! socketCommands.emit('new instructions', msg);
      
    }
  }
}


//this means that we got url commands from socket server to tell us where to go.
/*  ***** PUT THIS BACK AFTER YOU GET A https version 
socketCommands.on('send instructions', function(msg) {
  if (idiagramSvg.messageServer === false) {
    //I don't know the state of these address values, so store them, change them, then restore them.
    var addressAutoUpdateState = $.address.autoUpdate();
    var addressHistoryState = $.address.history();
    $.address.autoUpdate(true); //when I update the address, I want this to show up in the address bar.
    $.address.history(true); //we want to store this change in browser history
    $.address.value(msg);
    
    //now restore the states
    $.address.history(addressHistoryState);
    $.address.autoUpdate(addressAutoUpdateState);
    idiagramSvg.processAddress();
    //  idiagramSvg.processCommandsInURL(msg, null); //TODO: handle scrollToId parameter

  }
});*/
var myClientSocket = {
  emitCommandsForUrl: emitCommandsForUrl,
  socketCommands:socketCommands
};
module.exports = myClientSocket;
