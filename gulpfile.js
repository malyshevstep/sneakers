'use strict';
let projectFolder = 'dist';
let sourceFolder = 'source';
let fs = require('fs');

let path = {
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/css/',
        js: projectFolder + '/js/',
        img: projectFolder + '/img/',
        fonts: projectFolder + '/fonts/',
    },
    src: {
        html: sourceFolder + '/*.html',
        css: sourceFolder + '/less/style.less',
        js: sourceFolder + '/js/script.js',
        img: sourceFolder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
        fonts: sourceFolder + '/fonts/*.ttf',
    },
    watch: {
        html: sourceFolder + '/**/*.html',
        css: sourceFolder + '/less/**/*.less',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
        /*
        fonts: sourceFolder + '/fonts/*.ttf', === > Шрифты постоянно слушать не обязательно
        */
    },
    clean: './' + projectFolder + '/'
}

let {src, dest} = require('gulp');
let gulp = require('gulp');
let browsersync = require('browser-sync').create();
let del = require('del');
let less = require('gulp-less');
let autoprefixer = require('gulp-autoprefixer');
let group_media = require('gulp-group-css-media-queries');
let clean_css = require('gulp-clean-css');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;
let imagemin = require('gulp-imagemin');
let webp = require('gulp-webp');
let webphtml = require('gulp-webp-html');
let webpcss = require('gulp-webp-css');
let svgSprite = require('gulp-svg-sprite');
let fonter = require('gulp-fonter');

function browserSync (params) {
    browsersync.init({
        server: {
            baseDir: './' + projectFolder + '/'
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
    .pipe(
        less({
            outputStyle: 'expanded'
        })
    )
    .pipe(
        group_media(),
    )
    .pipe(
        autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true,
        })
    )
    .pipe(webpcss()) // НАДО ЕЩЕ ДОБАВИТЬ СКРИПТ С ФУНКЦИЕЙ ТРАНСФОРМАЦИИ КАРТИНОК В ВЕБП!!!
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
        rename({
            extname: '.min.css'
        })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
    .pipe(dest(path.build.js))
    .pipe(
        uglify()
    )
    .pipe(
        rename(
            {
                extname: '.min.js'
            }
        )
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
    .pipe(
        webp({
            quality: 70,
        })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false}],
                interlaced: true,
                optimizationLevel: 3, // От 0 до 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}


// == Ниже - это отдельная задача, которая вызывается по svgSprite и создает спрайт из СВГ картинок
gulp.task('svgSprite', function () {
    return gulp.src([sourceFolder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: '../icons/icons.svg', // Имя файла спрайта
                // example true - можно убрать комментарий и функция создаст пример html файл с иконками svg
            }
        },
    }
    ))
    .pipe(dest(path.build.img))
})


function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images) // в квадратных скобках путь, а после запятой - название функции-обработчика!
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images));

let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;