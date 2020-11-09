const destinationFolder = 'build';
const { src, dest, watch,  series, parallel, start} = require('gulp');
let IS_PRODUCT = !!process.env.PRODUCT;

console.log('IS_PRODUCT ==> ', IS_PRODUCT);

let gulp = require('gulp'),
  gulpif = require('gulp-if'),
  concat = require('gulp-concat'),
  multipipe = require('multipipe'),
  del = require('del'),
  sourcemaps = require('gulp-sourcemaps'),
  print = require('gulp-print').default,
  stylus = require('gulp-stylus'),
  pug = require('gulp-pug'),
  uglify = require('gulp-uglify-es').default,
  connect = require('gulp-connect');

exports.templates = function templates () {
  return multipipe(
    src(['src/**/*.pug']),
    pug({pretty: true}),
    dest(destinationFolder),
    gulpif(!IS_PRODUCT, connect.reload())
  );
};

exports.styles = function styles() {
  return multipipe(
    src(['src/**/*.styl']),
    gulpif(!IS_PRODUCT, sourcemaps.init()),
    stylus(),
    concat('app.css'),
    gulpif(!IS_PRODUCT, sourcemaps.write()),
    dest(`${destinationFolder}`)
  );
};


exports.js = function js() {
  return multipipe(
    src([
      'src/items/V.js',
      'src/items/**.js',
      'src/utils.js',
      'src/**/*.js'
    ]),
    gulpif(!IS_PRODUCT, sourcemaps.init()),
    concat('app.js'),
    gulpif(IS_PRODUCT, uglify()),
    gulpif(!IS_PRODUCT, sourcemaps.write()),
    dest(`${destinationFolder}`)
  );
};

exports.assets = function assets () {
  return multipipe(
    src(['src/assets/**/*']),
    dest(destinationFolder)
  );
};

exports.default = parallel(exports.js, exports.templates, exports.assets, exports.styles);

exports.watch = function () {
  connect.server({
    root: destinationFolder,
    port: 8888
    // livereload: true
  });
  exports.default();
  let params = {usePolling: true};
  watch('./src/**/*.js', params, exports.js);
  watch('./src/**/*.styl', params, exports.styles);
  watch('./src/**/*.pug', params, exports.templates);
  watch('./src/assets/**/*', params, exports.assets)
};