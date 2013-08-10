/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-7-30
 * Time: 下午11:26
 * Outter wrapper.
 */
var fs = require("fs");
var base = require("./base");

/**
 * The spider util.
 * @type {*}
 */
exports.spider = require("nodegrass");

/**
 * The core base class.
 * @type {Function}
 */
exports.base = base.core;

/**
 * Some useful functions.
 */
exports.util = base.util;

/**
 * Get the logger
 * @param name
 * @param level
 * @returns {*}
 */
exports.getLogger = function(name, level) {
    return base.logger(name, level);
}

/**
 * Get an OJ spider.
 * @type {*}
 */
exports.getOJSpider = base.getOJSpider;

var globallogger = null;
exports.logger = exports.getLogger;

/**
 * Create a pre-dev version server.
 * It just for developer's testing.
 *
 * @param name
 * @returns {*}
 */
exports.startPreDevTesterServer = function(name, port) {
    try {
        var srv = require("./pre-dev/" + name);

        srv.start(port);
    } catch(e) {
        console.log(e);
    }
};

/**
 * Start a tester server.
 * @param ojname
 * @param port
 */
exports.startTesterServer = function(ojname, showname, port) {
    var testerSrv = require("./pre-dev/util/server");
    testerSrv.startTestServer(ojname, showname, port);
}
