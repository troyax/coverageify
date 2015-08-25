var helper = require('./libs/helper');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();
var through = require('through');

function instrument(file, content) {
    return instrumenter.instrumentSync(content, file);
}

module.exports = function (file, options) {
    var config = options || {};
    var content = '';
    var ignoredFile = false;
    var patternsToBeIgnored = config.ignores || [];
    var patternsToBeContained = config.contains || [];

    ignoredFile = (helper.containsPatterns(file, patternsToBeIgnored) || ignored);

    ignoredFile = (helper.doNotContainsPatterns(file, patternsToBeContained) || ignored);

    function write (buffer) {
        content += buffer;
    }

    function end () {
        var code = helper.getCode(content);
        var ignoredInCoverage = helper.hasCommentWith(code, new RegExp('ignore +test +coverage'));
        var src = (ignoredInCoverage) ? content : instrument(file, content);

        this.queue(src);
        this.queue(null);
    }

    return (ignoredFile) ? through() : through(write, end);
};