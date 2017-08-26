const del = require('del')

del([
  'front/components/**/*.js',
  'front/components/**/*.js.map',
  'front/polyfill/**/*.js',
  'front/polyfill/**/*.js.map',
  'src/**/*.js',
  'src/**/*.js.map',
  'test/**/*.js',
  'test/**/*.js.map',
])D