# gulp-help-doc
[![Build Status](https://travis-ci.org/Mikhus/gulp-help-doc.svg?branch=master)](https://travis-ci.org/Mikhus/gulp-help-doc)  [![NPM License](https://img.shields.io/npm/l/gulp-help-doc.svg)](https://raw.githubusercontent.com/Mikhus/gulp-help-doc/master/LICENSE)

Self-documented gulp tasks with pretty printable usage information in command-line.

<!-- toc -->

- [Install](#install)
- [Using](#using)
- [How it works?](#how-it-works)
- [Restrictions](#restrictions)
- [API](#api)
- [License](#license)

<!-- tocstop -->

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
 * @order {1}
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
 * @arg {argTwo} second argument description
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
     --argTwo       second argument description
     --argThree     third argument description
                    Depends: ["demo"]
```

Since version 1.1.0 it also supports tasks grouping using `@group` tag:

```javascript
var gulp = require('gulp');
var usage = require('../index');

/**
 * Prints this help usage
 *
 * @task {help}
 * @group {Misc}
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
```

The example above will output something like:

```
Usage: gulp [task] [options]
Tasks:
 Building tasks
    build           Builds entire project
                    Depends: ["build:css","build:js"]

    build:css       Builds css bundle

    build:js        Builds js bundle

 Misc
    help            Prints this help usage
```

When groups are enabled it will also use @order tags for groups sorting. In this
case sorting is done using minimal @order value assigned to a task element in
the group. Then inside a group it will arrange task elements by their specified
@order.

## How it works?

This plugin enables you to use jsDoc-like tags to document your tasks
and make those task documentation availabe from command-line as usage
information.

  * `@task {task_name}`
  * `@arg {arg_name} arg_description`
  * `@order {order_number}`
  * `@group {group_name}`

Task description could be written in a free form before the `@task` tag
declaration.

If `@task` tag is omitted then the task will not appear in usage call.

Optionally, you can use the `@order` tag to sort the tasks descriptions
in the output. A task with `@order {1}` will appear before a task
with `@order {2}`. All tasks without this tag will appear at the end
of the list, sorted alphabetically. If groups are enabled (by specifying 
`group` tag on the tasks) `@order` tags assigned to the tasks also influence on 
groups arrangement. Task groups will be ordered by a minimal `@order` values 
found inside each group.

## Restrictions

When using TypeScript version of gulpfile it does not support task 
doc definitions outside of main `gulpfile.ts`, so it is recommended to 
describe with docs all tasks in a main gulpfile.

## API

This module provides you with usage() function which takes 2 arguments:

  * **gulp** - the instance of gulp, usage info for which must be printed
  * **options** - optional parameter, which allows to tune some printing
  options.

Options are:

  * **lineWidth** - max line width for the printed output lines (by default
    is 80 characters long)
  * **keysColumnWidth** - max width of the column width tasks/args
    names (by default is 20 characters long)
  * **padding** - number of empty characters for left-padding of the output
  * **groupPadding** - number of empty characters before group name output, 
    by default is 1
  * **defaultGroupName**: if group tag is not specified it will use specified
    group name, by default this name is 'Common tasks'
  * **logger** - printing engine (by default is console). May be changed
    to gulp-util or some other printing device if required.
  * **displayDependencies** - if set to `true` (default), prints the task
    dependencies below its help description
  * **emptyLineBetweenTasks** - if set to `true` (default), prints an empty
    line between tasks help descriptions
  * **gulpfile** - full path to gulpfile containing jsDoc tags.  By default 
    ignores any files in node_modules.  

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
