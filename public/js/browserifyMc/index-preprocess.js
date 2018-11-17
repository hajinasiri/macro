//this is used by browserify. Type npm run build to build js/mod/build.js
//global.$  = global.jQuery = require('./js/jquery');

global.jQuery = global.$ = require('jquery');
//global.Promise = require('bluebird');
//require("../jquery-ui.js");
require('jquery-ui-browserify');

global.Tether = require("./js/tether.min.js");
require("jquery-layout");
global.showdown = require("./js/showdown.min.js");
//global.$.address = require("./js/jquery.address.js");
require("./js/jquery.address.js");
require("./js/jquery.qtip.min.js");
//require("./js/CSSPlugin.min.js");
//require("./js/EasePack.min.js");
//global.TweenLite = require("TweenLite.js");
require('gsap');
require("./js/hammer.js");
global.svgPanZoom = require('svg-pan-zoom');
//global.svgPanZoom = require("../svg-pan-zoom.js");
global.present = require("./js/present.js");
global.myLayoutObj = require('./js/idiagram-ui.js');
//global.io = require('./js/socket.io-1.4.5.js');
//require('idiagram-ui.js');
global.myClientSocket = require('./js/my-client-socket.js');
//require('handlebars/runtime');


//require("./js/bootstrap.js");

global.Handlebars = require('handlebars');

global.baseIdClass = require("./js/babelLib/baseIdClass.js");
//global.dbIo = require("./js/babelLib/dbIo.js");
global.mapDbApi = require("./js/babelLib/mapDbApi.js");
global.idiagramUtil = require('./js/babelLib/idiagram-util.js');
//global.idiagramUtil = require('./js/babelLib/dropdownmenu.js');
//global.idiagramSvg = require('./js/idiagram-svg.js');
global.idiagramSvg = require('./js/preprocess-svg.js');
require('./js/svg.js');
require('./js/babelLib/DrawSVGPlugin.js');
global.localforage = require('./js/localforage.min.js');
//Promise.promisifyAll(require("redis"));