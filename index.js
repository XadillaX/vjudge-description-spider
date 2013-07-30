/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-7-30
 * Time: 下午11:26
 * Outter wrapper.
 */
var fs = require("fs");
var base = require("./base");

exports.spider = require("nodegrass");
exports.base = base.core;
exports.util = base.util;

exports.getLogger = function(name, level) {
    return base.logger(name, level);
}

var globallogger = null;
exports.logger = exports.getLogger;

exports.preDevTesterServer = function(name) {
    try {
        var srv = require("./pre-dev/" + name);
        return srv;
    } catch(e) {
        console.log(e);
    }
};