const webpack = require('webpack');
const definePlugin = require('webpack/lib/DefinePlugin');

// webpack plugins
const providePlugin = require('webpack/lib/ProvidePlugin');
const commonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');  // use for static assets
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

const path = require('path');
const autoprefixer = require('autoprefixer');
const env = require('./env');

module.exports = {

  bail: true,

  devtool: 'source-map',

  entry: {
    app: './src/index.js',
    vendor: ['./src/vendor.js']
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name]-[hash].min.js',
    sourceMapFilename: '[name]-[hash].map',
    chunkFilename: '[id]-[chunkhash].js'
  },

  resolve: {
    extensions: ['.js', '.scss', '.json'],
    modules: ['node_modules', 'src']
  },

  module: {
    rules: [

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },

      {
        test: /\.json$/,
        use: 'json-loader'
      },

      {
        test: /\.(woff|woff2)(\?[v=\d\.]+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff'
      },

      {
        test: /\.ttf(\?[v=\d\.]+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },

      {
        test: /\.eot(\?[v=\d\.]+)?$/,
        use: 'file-loader'
      },

      {
        test: /\.svg(\?[v=\d\.]+)?$/,
        use: 'url-loader?limit=10000&mimetype=image/svg+xml'
      },

      {
        test: /\.png$/,
        use: 'url-loader?limit=10240&mimetype=image/png'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader?localIdentName=[name]__[local]&minimize&sourceMap&importLoaders=2',
            'postcss-loader',
            'sass-loader?outputStyle=expanded&sourceMap'
          ]
        })
      }
    ],
  },

  plugins: [
    new commonsChunkPlugin({
      name: ['app', 'vendor'],
      minChunks: Infinity
    }),
    new definePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      },
      __DEVELOPMENT__: false,
      __TEST__: false
    }),
    new LoaderOptionsPlugin({
      options: {
        context: '/',
        sassLoader: {
          includePaths: [path.resolve(__dirname, './src')]
        },
        postcss: function () {
          return [autoprefixer];
        }
      }
    }),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '.')
    }),
    new ExtractTextPlugin('[name]-[chunkhash].min.css'),
    new UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    })
  ],

};