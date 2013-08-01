/**
 * Created with JetBrains WebStorm.
 * User: xadillax
 * Date: 13-7-30
 * Time: 下午11:01
 * Some useful function for the module.
 */
var crypto = require("crypto");
var problemobject = require("./problemobject");

/**
 * Create the md5 sum string.
 * @param str
 * @returns {string}
 */
exports.md5 = function(str) {
    return crypto.createHash("md5").update(str).digest("hex");
};

/**
 * Get a random integer from min to max.
 * @param min
 * @param max
 * @returns {number}
 */
exports.random = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * The problem object.
 * @type {*}
 */
exports.problemObject = problemobject;

/**
 * To unixify the text.
 * replace "\r\n" by "\n".
 */
exports.unixify = function(text) {
    return text.replace(/\r\n/g, "\n");
};
