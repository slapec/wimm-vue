const browserify = require('browserify');
const browserSync = require('browser-sync');
const bundle = require('gulp-bundle-assets');
const cleanCSS = require('gulp-clean-css');
const fs = require('fs');
const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const util = require('gulp-util');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');
const vueify = require('vueify');
const watchify = require('watchify');

const PROXY = 'http://127.0.0.1:8080';

const PATHS = {
    style: './app/sass/style.scss',
    scss: './app/sass/*.scss',
    main: './app/js/main.js',
    html: './templates/index.html',
    dest: './static/app/'
};

// sass ------------------------------------------------------------------------
gulp.task('build:sass', () => {
    return gulp.src(PATHS.style)
        .pipe(gulpSass().on('error', gulpSass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest(PATHS.dest));
});

gulp.task('watch:sass', ['build:sass'], () => {
    return gulp.watch(PATHS.scss, () => {
        return gulp.src(PATHS.style)
            .pipe(gulpSass().on('error', gulpSass.logError))
            .pipe(cleanCSS())
            .pipe(gulp.dest(PATHS.dest))
            .pipe(browserSync.stream({match: '**/*.css'}));
    });
});

// app -------------------------------------------------------------------------
gulp.task('build:js', () => {
    let b = browserify({
            entries: [PATHS.main],
            transform: [vueify],
            debug: true
        });

    b.on('log', util.log);

    return b.bundle()
        .pipe(vinylSourceStream('main.js'))
        .pipe(vinylBuffer())
        .pipe(gulp.dest(PATHS.dest));
});

gulp.task('watch:js', () => {
    let b = browserify({
        entries: [PATHS.main],
        transform: [vueify],
        plugin: [watchify],
        cache: {},
        packageCache: {},
        debug: true
    });

    function bundle(){
        return b.bundle()
            .pipe(vinylSourceStream('main.js'))
            .pipe(vinylBuffer())
            .pipe(gulp.dest(PATHS.dest))
            .pipe(browserSync.stream({once: true}));
    }

    b.on('update', bundle);
    b.on('log', util.log);
    return bundle();
});

// html ------------------------------------------------------------------------
gulp.task('watch:html', () => {
    return gulp.watch(PATHS.html, () => {
        browserSync.reload();
    })
});


// main tasks ------------------------------------------------------------------
gulp.task('default', ['build:sass', 'build:js']);

gulp.task('watch', ['watch:sass', 'watch:html', 'watch:js'], () => {
    browserSync.init({
        proxy: PROXY,
        open: false,
        notify: false
    });
});
