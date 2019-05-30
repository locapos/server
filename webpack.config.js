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
    // new webpack.optimize.UglifyJsPlugin()
  ],
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      { 
        test: /\.jsx$/, 
        exclude: /node_modules/, 
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            }
          }
        ]
      }
    ]
  }
};
