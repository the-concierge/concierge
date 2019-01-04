import * as process from 'process'
import * as path from 'path'

const VueLoaderPlugin = require('vue-loader/lib/plugin')

export = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: './front/index.ts',
  output: {
    path: path.resolve(process.cwd(), 'front'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              // enable CSS Modules
              // modules: true,
              // customize generated class names
              localIdentName: '[local]_[hash:base64:8]'
            }
          }
        ]
      },
      {
        test: /\.ts?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'scripts/tsconfig.front.json',
              appendTsSuffixTo: [/\.vue$/]
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          esModule: true
        }
      }
    ]
  },
  plugins: [new VueLoaderPlugin()]
}
