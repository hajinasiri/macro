var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
//var path = require("path");
//var CommonsChunkPlugin = require("../../lib/optimize/CommonsChunkPlugin");

module.exports = {
  context: __dirname + '/public',
 devtool: debug ? "inline-source-map" : null,
  entry: 
  {
     //bundleCss: './js/mod/modActivator.js',
     modActivator1: './js/mod/modActivator.js'

  }


  ,
  output: {
    path: __dirname + "/public/js/mod",
    filename: "bundle.css.js",
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      'jquery.js': __dirname + '/public/js/jquery.js',
      'jquery-ui': __dirname + "/public/js/jquery-ui.js",
      'jquery.layout': __dirname + "/public/source/stable/jquery.layout.js",
      'showdown.min': __dirname + "/public/js/showdown.min.js",
      'jquery.address': __dirname + "/public/js/jquery.address.js",
      'idiagram-ui': __dirname + "/public/js/idiagram-ui.js",
      'jquery.qtip.min': __dirname + "/public/js/jquery.qtip.min.js",
      'svg-pan-zoom': __dirname + "/public/js/svg-pan-zoom.js",
      'present': __dirname + "/public/js/present.js",
      'idiagram-svg': __dirname + "/public/js/idiagram-svg.js",
      'CSSPlugin.min': __dirname + "/public/js/CSSPlugin.min.js",
      'EasePack.min': __dirname + "/public/js/EasePack.min.js",
      'TweenLite.min': __dirname + "/public/js/TweenLite.min.js",
      'jquery.qtip.min.css': __dirname + "/public/stylesheets/jquery.qtip.min.css",
      'mapWindow.css': __dirname + "/public/stylesheets/mapWindow.css",
      'svg-styles.css': __dirname + "/public/stylesheets/svg-styles.css"


    }
  },
  plugins: debug ? [ new webpack.ProvidePlugin({
      IdiagramUi: __dirname + '/public/js/idiagram-ui.js',
      
      presObj: __dirname + '/public/js/present.js',
      zoomTiger:__dirname + '/public/js/idiagram-svg.js'
    })] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      sourcemap: false
    }),
  ],
  module: {
    loaders: [{
      test: /\.css$/,
      loader: 'style!css!'
    }]
  }
};