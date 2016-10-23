var webpack = require("webpack");

module.exports = {
  context: __dirname + '/src',
  entry: {
    'app': './jsx/app.jsx',
  },
  output: {
    path: __dirname + '/public/js',
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { 
        test: /\.jsx$/, 
        exclude: /node_modules/, 
        loader: "babel", 
        query:{
          presets: ['react', 'es2015']
        }
      }
    ]
  }
};
