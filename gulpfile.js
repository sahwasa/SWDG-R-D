// load packages
const { src, dest, lastRun, watch, series, parallel } = require("gulp"),
      gulpInc = require("gulp-file-include"),
      merge = require('merge-stream'),            // 여러 스트림 병합
      concat = require("gulp-concat"),                  // 파일 병합
      imgmin = require("gulp-imagemin"),                // 이미지압축
      sass = require('gulp-sass')(require('sass')),     // scss 컴파일
      newer = require("gulp-newer"),                    // dist 폴더의 결과물보다 최신의 
      archiver = require('gulp-archiver'),
      del = require('del'),
      config = require('./gulp.config'),
      bs = require("browser-sync").create();            // browser-sync 호출, create 메서드로 생성을 먼저 해줘야 함(브라우저 자동 *refresh 어플리케이션)

// babel = require("gulp-babel"),                    // js 컴파일
//sourcemaps = require('gulp-sourcemaps'),          // 소스맵생성.gulp 4.0이상부턴 필요 x
//const autoprefixer = require('gulp-autoprefixer');      // css prefix
//const gcmq = require("gulp-group-css-media-queries");   // 중복되는 mediaquery 구문 merge
//const cleanCSS = require('gulp-clean-css');             // css minify -> gcmq 사용 시 sass outputStyle이 적용이 안되므로 css compressed를 위해 추가

const dev = "dev";
const dist = "dist";

// 작업용 폴더 파일 path
const path = {
  html: [
    dev + "/**/*.html",
    "!" + dev + "/**/inc/**/*.html"   // ⭐ inc 폴더 제외
  ],
  htmlWatch: dev + "/**/*.html", 
  scss: dev + "/scss/**/*.scss",
  js: config.js,
  images: dev + "/**/images/**/*"
};

// js, scss concat(병합) 시 파일 이름 지정
var mergefileName = {
    style: "merge.css",
    //javascript: "merge.js"
};

// browser-sync index file
const browserSyncFileName = "model-list.html";

// 배포 시 삭제할 폴더
// 배포 시 삭제할 파일/폴더
const cleanPaths = [
  dist + '/css/**/*',           // CSS 전체
  dist + '/js/**/*',            // JS 전체 
  dist + '/**/*.html',          // HTML 전체
  dist + '/images/**/*_tmp*',   // ✅ 추가: 임시 이미지 파일
  dist + '/**/temp'             // temp 폴더
];
// task start
function inc(){
  return merge(
    src(path.html,{ base: dev + '/html' })
    .pipe(gulpInc({
      prefix : '@@',
      basepath : dev + '/html'
    }))
    .pipe(dest(dist + '/'))
    .pipe(bs.stream())
  )
}
function fonts() {
  return src(dev + '/font/**/*')
    .pipe(dest(dist + '/font/'));
}
function imgMin(){
  return src(path.images,)
  .pipe(newer(dist + "/"))
  .pipe(imgmin().on('error', function(err) {
    console.error('Image Error:', err);
    this.emit('end');}))
  .pipe(dest(dist + '/'))
  .pipe(bs.stream())
}
// scss options
var scssOptions = {
  // outputStyle : "expanded",// nested, expanded, compact, compressed
  style : "expanded",// nested, expanded, compact, compressed
  indentType : "tab",// 들여쓰기 space, tab
  indentWidth : 1,// 들여쓰기 갯수 / default: 2  
  sourceComments: false // 컴파일 된 css에 원본 소스이 위치와 줄 수 주석 표시
}

function scss(){
  return merge(
    src([path.scss, '!' + dev + "/scss/**/_*.scss"], {sourcemaps: true })
    //.pipe(concat(mergefileName.style))
    //.pipe(sourcemaps.write('/maps'))
    // .pipe(dest(dist + '/css',{ sourcemaps: true }))
    .pipe(sass(scssOptions).on('error', sass.logError))
    .pipe(dest(dist + '/css', { sourcemaps: './maps' }))
    .pipe(bs.stream())
  )
}
function js(){
  return merge(
    src(path.js)
    //.pipe(babel())
    .pipe(dest(dist + '/js'))
    .pipe(bs.stream())
  )
}
function setBs(){
  bs.init({
    server :{
      baseDir : 'dist/',
      index: browserSyncFileName
    }
  });
}
function watchs(){  
  watch(path.htmlWatch, inc);
  watch(path.images, imgMin);
  watch(path.js, js);
  watch(path.scss, scss);  
  watch(dev + '/font/**/*', fonts);
}

// 배포용 압축 태스크 추가
function deploy() {
  const today = new Date().toISOString().slice(0,10);
  return src(dist + '/**/*')
    .pipe(archiver('publish_' + today + '.zip'))
    .pipe(dest('./'));
}
// dist 폴더 정리
function clean(cd){
  return del(cleanPaths,cd).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
};

/* 
 * ==============================
 * gulp 실행
 * Command Line Texting -> watch: gulp, build: gulp build
 * series 함수는 Task를 순차적으로 실행
 * parallel 함수는 Task를 병렬로 실행
 * ==============================
*/


module.exports = {
  default:series(clean, inc, parallel(js,scss,imgMin, fonts), parallel(watchs, setBs)),
  watch:parallel(watchs, setBs),
  build:series(clean, parallel(inc,js,scss,imgMin, fonts)),
  deploy: series(clean, parallel(inc, js, scss, imgMin, fonts), deploy),
  clean : clean,
  inc : inc,
  js: js,
  scss : scss,
  imgMin : imgMin,
  setBs : setBs,
};