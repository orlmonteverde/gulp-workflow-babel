import gulp from 'gulp';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import browserSync from 'browser-sync';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import watch from 'gulp-watch';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import buffer from 'vinyl-buffer';

const server = browserSync.create();

const postcssPlugins = [
  cssnano({
    core: false,
    autoprefixer: {
      add: true,
      browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1',
    },
  }),
];

const sassOptions = {
  outputStyle: 'expanded',
};

gulp.task('sass', () =>
  gulp.src('./src/scss/styles.scss')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber())
    .pipe(sass(sassOptions))
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(server.stream({ match: '**/*.css' })));

gulp.task('pug', () =>
  gulp.src('./src/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest('./dist')));

gulp.task('js', () =>
  browserify('./src/js/index.js')
    .transform(babelify)
    .bundle()
    .on('error', (err) => {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js')));

gulp.task('default', () => {
  server.init({
    server: {
      baseDir: './dist',
    },
  });

  watch('./src/scss/**/*.scss', () => gulp.start('sass'));
  watch('./src/js/**/*.js', () => gulp.start('js', server.reload));
  watch('./src/pug/**/*.pug', () => gulp.start('pug', server.reload));
});

gulp.task('build', ['js', 'pug', 'sass']);
