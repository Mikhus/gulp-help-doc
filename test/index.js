var help = require('../index');
var gulp = require('gulp');
var expect = require('chai').expect;

var glob = typeof window === 'undefined' ? global : window;

if (typeof glob.describe === 'undefined') {
    glob.describe = function() {};
    glob.it = function() {};
}

/**
 * Demo task
 *
 * @task {demo}
 * @arg {env} environment
 */
gulp.task('demo', function() {});

// testing section

describe('help', function() {
    it('it should correctly parse task dock-blocks and produce valid output',
    function(done) {
        var logger = {
            output: '',
            log: function(msg) {
                logger.output += msg + '\n';
            }
        };

        help(gulp, {
            logger: logger,
            gulpfile: 'test/index.js'
        }).then(function() {
            // clean-up output from ANSI colors
            var output = logger.output.replace(
                /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                ''
            );

            expect(output).to.match(/Usage:\sgulp\s\[task\]\s\[options\]\n/);
            expect(output).to.match(/Tasks:\n/);
            expect(output).to.match(/\s+demo\s+Demo task\n/);
            expect(output).to.match(/\s+--env\s+environment\n/);

            done();
        });
    });
});
