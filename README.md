# gulp-help-doc
[![Build Status](https://travis-ci.org/Mikhus/gulp-help-doc.svg?branch=master)](https://travis-ci.org/Mikhus/gulp-help-doc)

Self-documented gulp tasks with pretty printable usage information in command-line.

## Install

    $ npm install gulp-help-doc

## Using

Example `gulpfile.js`

```javascript
var gulp = require('gulp');
var usage = require('gulp-help-doc');
var args = require('yargs').argv;

/**
 * This simply defines help task which would produce usage
 * display for this gulpfile. Simple run `gulp help` to see how it works.
 * NOTE: this task will not appear in a usage output as far as it is not
 * marked with the @task tag.
 */
gulp.task('help', function() { return usage(gulp); });


/**
 * We may also link usage as default gulp task:
 */
gulp.task('default', ['help']);


/**
 * This task will appear in usage output, because it is marked with the
 * proper @task tag. Current information you're reading will be the task
 * description.
 *
 * @task {demo}
 */
 gulp.task('demo', function() {});

/**
 * Another task, which could handle some command-line argulents, for example,
 * by using 'yargs' module. It is possible to describe expected by a task
 * arguments using @arg tags. It is possible to specify as much argument
 * tags as required by the job done within this task. For example here we 
 * describe three arguments:
 *
 * @task {test}
 * @arg {argOne} first argument description which will appear in usage output
 * @arg {argTwo} second argument dsescription
 * @arg {argThree} third argument description
 */
gulp.task('test', ['demo'], function() {
    var one = args.argOne;
    var thwo = args.argTwo;
    var three = args.argThree;

    // ... do something taking args into account ...

});
```

Put this example gulpfile in your project's root directory and run the
following commands to install dependencies:

    $ npm install yargs gulp gulp-help-doc

Now you can simply run

    $ gulp help

or even more simply

    $ gulp

and it will print you the proper usage information. It should look like:

```
Usage: gulp [task] [options]
Tasks:
    demo            This task will appear in usage output, because it is marked with 
                    the proper @task tag. Current information you're reading will 
                    be the task description.

    test            Another task, which could handle some command-line argulents, 
                    for example, by using 'yargs' module. It is possible to describe 
                    expected by a task arguments using @arg tags. It is possible 
                    to specify as much argument tags as required by the job done 
                    within this task. For example here we describe three arguments:
     --argOne       first argument description which will appear in usage output
     --argTwo       second argument dsescription
     --argThree     third argument description
                    Depends: ["demo"]
```

## How it works?

This plugin enables you to use jsDoc-like tags to document your tasks
and make tose task documentation availabe from comman-line as usage
information.

  * `@task {task_name}`
  * `@arg {arg_name} arg_description`

Task description could be written in a free form before the `@task` tag
declaration.

If `@task` tag is omitted then the task will not appear in usage call.

## API

This module provides you with usage() function which takes 2 arguments:

  * **gulp** - the instance of gulp, usage info for which must be printed
  * **options** - optional parameter, which allows to tune some printing
  options.

Options are:

  * **lineWidth** - max line width for the printed output lines (by default
    is 80 characters long)
  * **keysColumnWidth** - max width of the column width tasks or args
    names (by default is 20 characters long)
  * **padding** - number of empty characters for left-padding of the output
  * **logger** - printing engine (by default is console). You may change
    it, for example, to gulp-util or some other printing device. It is
    expected that logger will have 'logger.log()' function defined which
    will do output.

Example of custom configuration: 

```javascript
const usage = require('gulp-help-doc');
const gutil = require('gulp-util');

gulp.task('help', function() {
    return usage(gulp, {
        lineWidth: 120,
        keysColumnWidth: 30,
        logger: gutil
    });
});
```

## License

[MIT](https://raw.githubusercontent.com/Mikhus/gulp-help-doc/master/LICENSE)