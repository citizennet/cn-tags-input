// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint        = require('gulp-jshint');
var uglify        = require('gulp-uglify');
var rename        = require('gulp-rename');
var sourcemaps    = require('gulp-sourcemaps');
var babel         = require('gulp-babel');

// Lint Task
gulp.task('lint', function() {
  return gulp.src('src/*.js')
      .pipe(jshint({
        multistr: true,
        validthis: true,
        evil: true,
        esnext: true
      }))
      .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src('src/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(rename('all.js'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('all.min.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

// Default Task
gulp.task('default', ['lint', 'scripts', 'watch']);