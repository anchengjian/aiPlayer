const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isDev = process.env.NODE_ENV === 'dev';

let config = {
  entry: {
    app: isDev ? ['webpack/hot/dev-server', './src/app.js'] : ['./src/app.js']
  },
  resolve: {
    extensions: ['', '.js', '.json', 'scss', 'html'],
    modulesDirectories: ['node_modules']
  },
  output: {
    publicPath: '/dist/',
    path: './dist/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js'
  },
  module: {
    noParse: [],
    preLoaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'eslint'
      }
    ],
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel?presets[]=es2015&presets[]=stage-2'
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer?{browsers:["last 2 version"]}')
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer?{browsers:["last 2 version"]}!sass-loader')
    }, {
      test: /\.(jpe?g|png|gif|svg|webp)$/,
      loader: 'url?limit=4096&name=imgs/[name].[ext]'
    }, {
      test: /\.html$/,
      loader: 'raw'
    }, {
      test: /\.json$/,
      loader: 'file?name=data/[name].[ext]'
    }, {
      test: /\.(svg|ttf|eot|woff|woff2)/,
      loader: 'file?name=fonts/[name].[ext]'
    }]
  },
  eslint: {
    emitError: true,
    emitWarning: true,
    failOnWarning: true,
    failOnError: true,
    configFile: '.eslintrc'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('css/[name].css')
  ]
};

module.exports = config;
