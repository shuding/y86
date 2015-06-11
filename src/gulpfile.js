var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    ngannotate = require('gulp-ng-annotate'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-minify-css'),
    minifyJs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    minifyHTML = require('gulp-minify-html');

var paths = {
    scripts: 'src/script/**/*.*',
    styles: 'src/style/**/*.*',
    images: 'src/image/**/*.*',
    templates: 'src/template/**/*.html',
    index: 'src/index.html',
    fonts: 'src/font/**/*.{ttf,woff,woff2,eof,svg}'
};

/**
 * Handle bower components from index
 */
gulp.task('usemin', function() {
    return gulp.src(paths.index)
        .pipe(usemin({
            //js: [/* ngannotate(), minifyJs(), */'concat'],
            css: [/*minifyCss({keepSpecialComments: 0}), */'concat'],
        }))
        .pipe(gulp.dest('dist/'));
});

/**
 * Copy assets
 */
gulp.task('build-assets', ['copy-fonts']);

gulp.task('copy-fonts', function() {
    return gulp.src(paths.fonts)
        .pipe(rename({
            dirname: '/fonts'
        }))
        .pipe(gulp.dest('dist/'));
});

/**
 * Handle custom files
 */
gulp.task('build-custom', ['custom-images', 'custom-js', 'custom-css', 'custom-templates']);

gulp.task('custom-images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('custom-js', function() {
    return gulp.src(paths.scripts)
        .pipe(ngannotate())
        .pipe(minifyJs())
        .pipe(concat('dashboard.min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('custom-css', function() {
    return gulp.src(paths.styles)
        //.pipe(minifyCss())
        .pipe(concat('dashboard.min.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('custom-templates', function() {
    return gulp.src(paths.templates)
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist/templates'));
});

/**
 * Watch custom files
 */
gulp.task('watch', function() {
    gulp.watch([paths.images], ['custom-images']);
    gulp.watch([paths.styles], ['custom-css']);
    gulp.watch([paths.scripts], ['custom-js']);
    gulp.watch([paths.templates], ['custom-templates']);
    gulp.watch([paths.index], function () {
        return gulp.src(paths.index)
            .pipe(usemin({
                js: ['concat'], // do not minify!!!!!!
                css: ['concat'],
            }))
            .pipe(gulp.dest('dist/'));
    });//['usemin']);
});

/**
 * Live reload server
 */
gulp.task('webserver', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 8888
    });
});

gulp.task('livereload', function() {
    gulp.src(['dist/**/*.*'])
        .pipe(watch())
        .pipe(connect.reload());
});

/**
 * Gulp tasks
 */
gulp.task('build', ['usemin', 'build-assets', 'build-custom']);
// do not usemin with livereload
gulp.task('default', ['usemin', 'build-assets', 'build-custom', 'webserver', 'livereload', 'watch']);