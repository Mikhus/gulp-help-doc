# gulp-help-doc
[![Build Status](https://travis-ci.org/Mikhus/gulp-help-doc.svg?branch=master)](https://travis-ci.org/Mikhus/gulp-help-doc)

This plugin allows to document gulp tasks with jsDoc-like comments
which are produces pretty printed tasks usage information.

## How it works?

First of all it is required to define usage task, for example, in the
`gulpfile.js`:

    const gulp = require('gulp');
    
    /**
     * This simply defines help task which would produce usage
     * display. Now we can simply run `gulp help`
     */
    gulp.task('help', () => require('gulp-help-doc')(gulp));
    
    
    /**
     * We may also link usage as default gulp task, now each type
     * simply `gulp` called from comman-line we will see its usage info.
     */
    gulp.task('default', ['help']);
    
The code above is just defines a way to call for usage information and
give the power of docblock comments to define what will appear in the
usage info.

Actually this plugin adds two dockblock tags for your use:

  * `@task {task_name}`
  * `@arg {arg_name} arg_description`

Task description could be written in a free form before the `@task` tag
declaration. For example. 

`@task` tag is required to mark the gulp task as the one which should
appear in a usage information, so if it is required to hide task from
usage info it is enough just to omit writing the tag for it.

Here a simple example of declaring a test task which runs mocha tests
for the current project and declaring usage information for it (and
documenting the task code as well at the same time):

    /**
     * This is just demo task. What is written here is a task 
     * description. It can be multiline and written in a fre-form.
     * All is required to have this description before @task docblock
     * tag.
     *
     * @task {demo}
     */
     gulp.task('demo', () => {});

    /**
     * This task runs the tests. This task accept arguments.
     *
     * @task {test}
     * @arg {app} if specified will run tests only for specified app
     */
    gulp.task('test', () => {
        let app = require('yargs').argv.app;
        let src = './test' + (app ? '/' + app : '');

        gulp.src(src).pipe(require('gulp-mocha')());
    });

As a result when running `gulp help` command from command-line it will
produce output like this:

    $  gulp help
      [13:25:25] Using gulpfile /path/to/gulpfile.js
      [13:25:25] Starting 'help'...
      Usage: gulp [task] [options]
      Tasks:
          demo            This is just demo task. What is written here is a task description. 
                          It can be multiline and written in a fre-form. All is required 
                          to have this description before @task docblock tag.
      
          test            This task runs the tests
           --app          if specified will run tests only for specified app
      
      [13:25:25] Finished 'help' after 4.4 ms

As may be seen from the output tasks `default` and `help` are not seen
in the usage info output because them was not marked with the `@task`
tag.

## API

    let help = require('gulp-help-doc');

This declaration defines a help function which takes 2 arguments:

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

    const help = require('gulp-help-doc');
    const gutil = require('gulp-util');

    gulp.task('help', () => help(gulp, {
        lineWidth: 120,
        keysColumnWidth: 30,
        logger: gutil
    }));
