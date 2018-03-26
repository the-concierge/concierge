import * as process from 'process'
import * as path from 'path'

export = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './front/index.ts',
  output: {
    path: path.resolve(process.cwd(), 'front'),
    filename: 'bundle.js'
  },
  resolve: {
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
              configFile: 'scripts/tsconfig.front.json'
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        options: {
          configFile: 'tsconfig.front.json',
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      }
    ]
  }
}
