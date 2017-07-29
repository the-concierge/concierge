const del = require('del')

del([
  'front/components/**/*.js',
  'front/polyfill/**/*.js',
  'src/**/*.js',
  'test/**/*.js',
])