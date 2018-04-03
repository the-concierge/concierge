import * as process from 'process'
import * as path from 'path'

export = {
  mode: 'development',
  devtool: '#eval-source-map',
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
        options: {}
      }
    ]
  }
}
