import gulp from 'gulp';
import plumber from 'gulp-plumber';
import gulpIf from 'gulp-if';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import { deleteAsync } from 'del';

const sass = gulpSass(dartSass);
let isDevelopment = true;

export const compileStyles = () => {
  return gulp.src('source/sass/*.scss', { sourcemaps: isDevelopment })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'), { sourcemaps: isDevelopment })
    .pipe(browser.stream());
};

export const compileHtml = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
    .pipe(browser.stream());
};

export const compileScripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

export const optimizeImg = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulpIf(!isDevelopment, squoosh()))
    .pipe(gulp.dest('build/img'));
};

export const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'));
};

export const optimizeSvg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/sprite/**/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
};

export const createSprite = () => {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};

export const copyAssets = () => {
  return gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
};

export const deleteBuild = () => {
  return deleteAsync('build');
};

export const startServer = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

const reloadServer = (done) => {
  browser.reload();
  done();
};

const watchFiles = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(compileStyles));
  gulp.watch('source/*.html', gulp.series(compileHtml, reloadServer));
  gulp.watch('source/js/*.js', gulp.series(compileScripts));
}

export const compileProject = (done) => {
  gulp.parallel(
    compileStyles,
    compileHtml,
    compileScripts,
    optimizeImg,
    optimizeSvg,
    createSprite,
    copyAssets,
    createWebp
  )(done);
};

export const buildProd = (done) => {
  isDevelopment = false;
  gulp.series(
    deleteBuild,
    compileProject
  )(done);
};

export const runDev = (done) => {
  gulp.series(
    deleteBuild,
    compileProject,
    startServer,
    watchFiles
  )(done);
}
