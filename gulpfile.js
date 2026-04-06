const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const del = require('del');
const browserSync = require('browser-sync').create();

// Paths
const paths = {
  scss: {
    src: 'css/pages/*.scss',
    watch: 'css/**/*.scss',
    dest: 'css/pages'
  },
  dist: {
    base: 'dist',
    css: 'dist/css/pages',
    js: 'dist/js',
    img: 'dist/img'
  }
};

// SCSS compile (dev)
function scssCompile() {
  return gulp.src(paths.scss.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// Clean dist
function clean() {
  return del([paths.dist.base]);
}

// Build CSS (minify)
function buildCSS() {
  return gulp.src(paths.scss.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist.css));
}

// Copy HTML
function copyHTML() {
  return gulp.src('index.html')
    .pipe(gulp.dest(paths.dist.base));
}

// Copy JS
function copyJS() {
  return gulp.src('js/**/*.js')
    .pipe(gulp.dest(paths.dist.js));
}

// Copy images
function copyImg() {
  return gulp.src('img/**/*', { allowEmpty: true })
    .pipe(gulp.dest(paths.dist.img));
}

// BrowserSync serve
function serve(done) {
  browserSync.init({
    server: { baseDir: './' },
    port: 3000,
    notify: false
  });
  done();
}

// Watch
function watchFiles(done) {
  gulp.watch(paths.scss.watch, scssCompile);
  gulp.watch('index.html').on('change', browserSync.reload);
  gulp.watch('js/**/*.js').on('change', browserSync.reload);
  done();
}

// Tasks
const build = gulp.series(clean, scssCompile, gulp.parallel(buildCSS, copyHTML, copyJS, copyImg));
const deploy = gulp.series(build);
const dev = gulp.series(scssCompile, serve, watchFiles);

// Export
exports.default = dev;
exports.build = build;
exports.deploy = deploy;
