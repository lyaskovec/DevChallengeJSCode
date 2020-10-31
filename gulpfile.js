const destinationFolder = 'build';
const path = require('path');
const { src, dest, watch,  series, parallel  } = require('gulp');

let gulp = require('gulp'),
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
    //sourcemaps.init(),
    pug({pretty: true}),
    dest(destinationFolder)
    //, connect.reload()
  );
};


exports.styles = function styles() {
  return multipipe(
    src(['src/**/*.styl']),
    sourcemaps.init(),
    stylus(),
    concat('app.css'),
    sourcemaps.write(),
    dest(`${destinationFolder}`),
    // connect.reload()
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
    sourcemaps.init(),
    concat('app.js'),
    // uglify(),
    sourcemaps.write(),
    dest(`${destinationFolder}`)
    // ,connect.reload()
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
    // livereload: true
  });
  exports.default();
  let params = {usePolling: true};
  watch('./src/**/*.js', params, exports.js);
  watch('./src/**/*.styl', params, exports.styles);
  watch('./src/**/*.pug', params, exports.templates);
  watch('./src/assets/**/*', params, exports.assets)
}