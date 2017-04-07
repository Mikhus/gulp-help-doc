var gulp = require('gulp');
var usage = require('../index');

/**
 * Prints this help usage
 *
 * @task {help}
 * @order {21}
 */
gulp.task('help', function() { return usage(gulp); });

/**
 * Builds entire project
 *
 * @task {build}
 * @group {Building tasks}
 * @order {11}
 */
gulp.task('build', ['build:css', 'build:js'], function() {});

/**
 * Builds css bundle
 *
 * @task {build:css}
 * @group {Building tasks}
 * @order {12}
 */
gulp.task('build:css', function() {});

/**
 * Builds js bundle
 *
 * @task {build:js}
 * @group {Building tasks}
 * @order {13}
 */
gulp.task('build:js', function() {});

gulp.task('default', ['help']);
