/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-7-30
 * Time: 下午10:44
 * Base of VJudge Description Spider.
 */
var util = require("util");
var log4js = require("log4js");
var logLevel = "TRACE";
var userAgent = "XadillaX' Virtual Judge Description Spider";
var crypto = require("crypto");

function vjdsbase(baseurl) {
    this.spider = require("nodegrass");
    this.logger = undefined;

    this.baseurl = baseurl;
    this.name = "";
    this.cookies = "";
}

/**
 * Get the page count.
 *
 * @param callback
 */
vjdsbase.prototype.getPageCount = function(callback) {
};

/**
 * Get the problemID list from page.
 *
 * @param pagenum
 * @param callback
 */
vjdsbase.prototype.getProblemIDListFromPage = function(pagenum, callback) {
};

/**
 * Get the problem id list from one page to another.
 * @param curpage
 * @param totpage
 * @param baseresult
 * @param callback
 * @private
 */
vjdsbase.prototype.__getProblemIDListFromPageRecursion = function(curpage, totpage, baseresult, callback) {
    var self = this;

    /**
     * To get the problem id list of this page.
     */
    this.getProblemIDListFromPage(curpage, function(status, msg, list) {
        /**
         * Combine the list to the baseresult.
         */
        if(status !== false) {
            for(var i = 0; i < list.length; i++) {
                baseresult.push(list[i]);
            }
        }

        /**
         * If it's the last page, we should call the callback function.
         * Or we should fetch the next page.
         */
        if(curpage === totpage) {
            var cb = callback.bind(self);
            setTimeout(cb, 1, true, "", baseresult);
            return;
        } else {
            this.__getProblemIDListFromPageRecursion(curpage + 1, totpage, baseresult, callback);
            return;
        }
    });
};

/**
 * Get the whole problem id list.
 * @param callback
 */
vjdsbase.prototype.getAllProblemIDList = function(callback) {
    var self = this;

    this.getPageCount(function(status, msg, pagecount) {
        if(status !== true) {
            if(undefined !== callback) {
                var cb = callback.bind(self);
                setTimeout(cb, 1, false, msg, []);
            }

            return;
        }

        this.__getProblemIDListFromPageRecursion(1, pagecount, [], callback);
    });
};

/**
 * Get the problemID list form a certain url.
 *
 * @param url
 * @param callback
 */
vjdsbase.prototype.getProblemIDListFromUrl = function(url, callback) {
};

/**
 * Get problem description by id.
 *
 * @param id
 * @param callback
 */
vjdsbase.prototype.getProblemByID = function(id, callback) {
};

/**
 * Check the md5 value of problem.
 * This function is mainly to verify the version of one problem.
 *
 * @param problem
 */
vjdsbase.prototype.md5sum = function(problem) {
    var str = "";

    if(typeof(problem) === "string") str = problem;
    else {
        for(var key in problem) {
            str += problem[key];
        }
    }

    var md5 = exports.md5(str);
};

/**
 * Set the logger level.
 * [ TRACE, DEBUG, INFO, WARN, ERROR, FATAL ]
 * @param level
 */
exports.setLogLevel = function(level) {
    logLevel = level;
};

exports.util = require("./lib/util");
exports.core = vjdsbase;
exports.logger = function(name, level) {
    if(name === undefined) name = "GLOBAL";
    if(level === undefined) level = logLevel;

    var logger = log4js.getLogger(name);
    logger.setLevel(level);

    return logger;
};

