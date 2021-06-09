const { src, dest, watch, parallel } = require("gulp");
const sass = require('gulp-sass');
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const babel = require('gulp-babel');
const eslint = require("gulp-eslint");
const sync = require("browser-sync").create();

function generateCSS(cb) {
  src('./src/sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(dest('public/stylesheets'))
      .pipe(sync.stream());
  cb();
}

exports.css = generateCSS;

function generateJS(cb) {
  src('src/js/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(dest('public/js'))
    .pipe(sync.stream());
  cb();
}

exports.js = generateJS;

function generateHTML(cb) {
  src("./views/index.ejs")
      .pipe(ejs({
          title: "Hello Semaphore!",
      }))
      .pipe(rename({
          extname: ".html"
      }))
      .pipe(dest("public"));
  cb();
}

exports.html = generateHTML;

function runLinter(cb) {
  return src(['**/*.js', '!node_modules/**'])
      .pipe(eslint())
      .pipe(eslint.format()) 
      .pipe(eslint.failAfterError())
      .on('end', function() {
          cb();
      });
}

exports.lint = runLinter;

// function defaultTask(cb) {
//   return src('src/js/*.js')
//     .pipe(babel())
//     .pipe(dest('public/js'));
//     cb();
// }
  
// exports.default = defaultTask

function watchFiles(cb) {
  watch('views/**.ejs', generateHTML);
  watch('src/sass/**.scss', generateCSS);
  watch([ 'src/**/*.js', '!node_modules/**'], series(runLinter, generateJS));
}

exports.watch = watchFiles;

function browserSync(cb) {
  sync.init({
      server: {
          baseDir: "./public"
      }
  });

  watch('views/**.ejs', generateHTML);
  watch('src/sass/**.scss', generateCSS);
  watch('src/js/**.js', generateJS);
  watch("./public/**.html").on('change', sync.reload);
}

exports.sync = browserSync;