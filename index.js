/**
 * Implements self-documented gulpfile
 *
 * @author Mykhailo Stadnyk <mikhus@gmail.com>
 */

// load polyfills
require('./lib/string');
require('./lib/object');

if (typeof Promise === 'undefined') {
    var Promise = require('es6-promise').Promise;
}

// load modules
var fs = require('fs');
var chalk = require('chalk');

/**
 * @external Gulp
 * @see {@link https://github.com/gulpjs/gulp/blob/master/docs/API.md}
 */

/**
 * Gulpfile reflection metadata
 *
 * @access private
 */
var reflection = {};

/**
 * @typedef {{
 *     lineWidth: number,
 *     keysColumnWidth: number,
 *     padding: number,
 *     groupPadding: number,
 *     logger: {
 *        log: function
 *     },
 *     isTypescript: boolean,
 *     gulpfile: string,
 *     displayDependencies: boolean,
 *     emptyLineBetweenTasks: boolean,
 *     defaultGroupName: string
 * }} ConfigOptions
 */

/**
 * Default options
 *
 * @type {ConfigOptions} OPTIONS
 */
var OPTIONS = {
    lineWidth: 80,
    keysColumnWidth: 20,
    padding: 4,
    groupPadding: 1,
    groupColor: 'magenta',
    logger: console,
    isTypescript: fs.existsSync('gulpfile.ts'),
    gulpfile: undefined,
    displayDependencies: true,
    emptyLineBetweenTasks: true,
    defaultGroupName: 'Common tasks'
};

function rdeps(nodes) {
    var deps = [];

    if (!nodes.length) return deps;

    nodes.forEach(function(node) {
        if (!node.branch) {
            deps.push(node.label);
        }

        deps = deps.concat(rdeps(node.nodes));
    });

    return deps.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
}

function gulpTasks(gulp) {
    if (!gulp.tree) {
        // old gulp
        return gulp.tasks;
    }


    // v4
    var nodes = gulp.tree({ deep: true }).nodes;
    var tasks = {};

    nodes.forEach(function(node) {
        tasks[node.label] = {
            name: node.label,
            dep: rdeps(node.nodes)
        };
    });

    return tasks;
}

/**
 * Analyzes given gulp instance and build internal cache
 * for further printing
 *
 * @param {Gulp} gulp
 * @access private
 */
function build(gulp) {
    // make sure we don't lose anything from required files
    // @see https://github.com/Mikhus/gulp-help-doc/issues/2
    // currently this is not supported for typescript

    var source = OPTIONS.isTypescript ?
        fs.readFileSync('gulpfile.ts').toString() :
        OPTIONS.gulpfile ?
            fs.readFileSync(OPTIONS.gulpfile).toString() :
        Object.keys(require.cache || {'gulpfile.js': ''}).map(function(file) {
            if (!/node_modules|\.json$/.test(file)) {
                return fs.readFileSync(file).toString() + '\n';
            }
        }).join('');

    var rxDoc = '\\/\\*\\*\\r?\n(((?!\\*\\/)[\\s\\S])*?)' +
        '@task\\s+\\{(.*)?\\}((?!\\*\\/)[\\s\\S])*?\\*\\/';

    var rxArgs = '@arg\\s+\\{(.*?)\\}(.*?)\\r?\\n';
    var rxOrder = '@order\\s+\\{(\\d+)\\}(.*?)\\r?\\n';
    var rxGroup = '@group\\s+\\{(.*?)\\}(.*?)\\r?\\n';

    var globalRxDoc = new RegExp(rxDoc, 'g');
    var localRxDoc = new RegExp(rxDoc);

    var globalRxArgs = new RegExp(rxArgs, 'g');
    var localRxArgs = new RegExp(rxArgs);

    var globalRxOrder = new RegExp(rxOrder, 'g');
    var localRxOrder = new RegExp(rxOrder);

    var globalRxGroup = new RegExp(rxGroup, 'g');
    var localRxGroup = new RegExp(rxGroup);

    var jsDoc  = (source.match(globalRxDoc) || []);
    var tasks = gulpTasks(gulp);

    Object.keys(tasks).forEach(function (task) {
        reflection[task] = {
            name: tasks[task].name,
            desc: '',
            dep: tasks[task].dep
        };
    });

    jsDoc.map(function (block) {
        var parts = block.match(localRxDoc);

        var name = parts[3].trim();
        var desc = parts[1].replace(/\s*\*/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();

        if (!reflection[name]) {
            return;
        }

        reflection[name].desc = desc;
        reflection[name].public = true;
        reflection[name].args = (block.match(globalRxArgs) || [])
            .map(function (def) {
                var argsParts = def.match(localRxArgs);

                return {
                    name: argsParts[1],
                    desc: argsParts[2].replace(/\s*\*/g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .trim()
                };
            });

        reflection[name].order = (function () {
            var orderParts = block.match(globalRxOrder);

            if (orderParts) {
                return +orderParts[0].match(localRxOrder)[1];
            }

            return Number.MAX_SAFE_INTEGER;
        })();

        reflection[name].group = (function () {
            var groupParts = block.match(globalRxGroup);

            if (groupParts) {
                return groupParts[0].match(localRxGroup)[1];
            }

            return OPTIONS.defaultGroupName;
        })();
    });

    // Re-group tasks using user-defined groups
    var tmp = {};

    Object.keys(reflection).forEach(function(task) {
        var group = reflection[task].group || OPTIONS.defaultGroupName;

        tmp[group] = tmp[group] || {};
        tmp[group][task] = reflection[task];
    });

    reflection = tmp;
}

/**
 * Chunks given string into pieces making each chunk less or equal to
 * OPTIONS.lineWidth, taking into account safe word-break
 *
 * @param {string} str
 * @param {number} maxLen
 * @returns {Array}
 * @access private
 */
function chunk(str, maxLen) {
    var len  = maxLen || OPTIONS.lineWidth;
    var curr = len;
    var prev = 0;
    var out  = [];

    while (str[curr]) {
        if (str[curr++] == ' ') {
            out.push(str.substring(prev, curr));
            prev = curr;
            curr += len;
        }
    }

    out.push(str.substr(prev));

    return out;
}

function hasTasks(group) {
    if (!reflection[group]) {
        return false;
    }

    return Object.keys(reflection[group]).some(function (task) {
        return reflection[group][task].public;
    });
}

/**
 * Performs usage strings output
 *
 * @access private
 */
function print() {
    OPTIONS.logger.log(chalk.bold('Usage: gulp [task] [options]'));
    OPTIONS.logger.log(chalk.bold('Tasks:'));

    var groups = Object.keys(reflection);
    var isMultiGroup = groups.length > 1;

    groups.filter(function (groupName) {
        return hasTasks(groupName);
    })
    .sort()
    .sort(function (a, b) { // ordering groups by @order tags
        return Math.min.apply(null,
            Object.keys(reflection[a]).map(function (task) {
                return reflection[a][task].order;
            })) - Math.min.apply(null,
            Object.keys(reflection[b]).map(function (task) {
                return reflection[b][task].order;
            }));
    })
    .map(function (groupName) {
        var reflectionGroup = reflection[groupName];
        var groupTasks = Object.keys(reflectionGroup);

        if (isMultiGroup ||
            !isMultiGroup && groupName !== OPTIONS.defaultGroupName
        ) {
            OPTIONS.logger.log(
                ' '.repeat(OPTIONS.groupPadding) +
                chalk.bold[OPTIONS.groupColor](groupName)
            );
        }

        groupTasks.filter(function (name) {
            return reflectionGroup[name].public;
        })
        .sort()
        .sort(function(a, b) { // ordering tasks inside group by @order tags
            return reflectionGroup[a].order - reflectionGroup[b].order;
        })
        .forEach(function (name) {
            var task = reflectionGroup[name];
            var deps = task.dep.filter(function (dep) {
                return reflectionGroup[dep] && reflectionGroup[dep].public;
            });
            var text = ' '.repeat(OPTIONS.padding) +
                chalk.bold.green(task.name) +
                ' '.repeat(
                    Math.max(1,OPTIONS.keysColumnWidth -
                        OPTIONS.padding -
                        task.name.length)
                );
            var chunks = chunk(task.desc, OPTIONS.lineWidth -
                OPTIONS.keysColumnWidth);
            var i = 0;

            OPTIONS.logger.log(text + chalk.bold(chunks[i]));

            if (chunks.length > 1) {
                while (chunks.length > ++i) {
                    (chunks[i].trim()) && (OPTIONS.logger.log(
                        ' '.repeat(OPTIONS.keysColumnWidth) +
                        chalk.bold(chunks[i])
                    ));
                }
            }

            task.args.forEach(function (arg) {
                var chunks = arg.desc ?
                    chunk(arg.desc,
                        OPTIONS.lineWidth - OPTIONS.keysColumnWidth) :
                    ['[boolean]'];
                var i = 0;

                OPTIONS.logger.log(
                    ' '.repeat(OPTIONS.padding + 1) +
                    chalk.bold.cyan('--' + arg.name) +
                    ' '.repeat(Math.max(1,
                        OPTIONS.keysColumnWidth - OPTIONS.padding -
                        arg.name.length - 3)) +
                    chunks[i]
                );

                while (chunks.length > ++i) {
                    (chunks[i].trim()) && (OPTIONS.logger.log(
                        ' '.repeat(OPTIONS.keysColumnWidth) +
                        chunks[i]
                    ));
                }
            });

            if (OPTIONS.displayDependencies && deps.length) {
                OPTIONS.logger.log(
                    ' '.repeat(OPTIONS.keysColumnWidth) +
                    chalk.bold.gray('Depends: ') +
                    chalk.grey(JSON.stringify(deps))
                );
            }

            if (OPTIONS.emptyLineBetweenTasks) {
                OPTIONS.logger.log('');
            }
        });
    });
}

/**
 * Prints usage help information for the given gulp
 * instance.
 * Usually it is used as a task within gulpfile.js in your project
 * Please make sure all your comments are properly annotated
 *
 * @examples
 * <caption>Typical usage:</caption>
 *  var gulp = require('gulp');
 *
 *  gulp.task('help', => require('gulp-help-doc')(gulp));
 *
 * @param {Gulp} gulp - gulp instance to analyze
 * @param {ConfigOptions} [options]
 * @returns {Promise}
 * @access public
 */
function usage(gulp, options) {
    // re-define options if needed
    if (options) {
        Object.assign(OPTIONS, options);
    }

    return new Promise(function(resolve) {
        build(gulp);
        print();
        resolve();
    });
}

module.exports = usage;
